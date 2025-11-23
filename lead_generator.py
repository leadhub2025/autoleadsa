import requests
import json
import os
import socket
import uuid
from urllib.parse import quote, urlparse
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ----------------------------------------------------------------------
# 1. Configuration & Supabase Connection
# ----------------------------------------------------------------------

# Configuration loaded from the .env file
VERCEL_API_URL = os.environ.get("VERCEL_API_URL")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")

ENDPOINT = "/api/generate"
INPUT_TABLE = "target_industries"  # The Supabase table with your topics
OUTPUT_TABLE = "leads"  # The Supabase table to save results

# Ensure required configuration is present
if not all([VERCEL_API_URL, SUPABASE_URL, SUPABASE_KEY]):
  raise EnvironmentError("Missing VERCEL_API_URL, SUPABASE_URL, or SUPABASE_ANON_KEY in .env file.")

# Initialize Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_topics_from_supabase():
  """Fetches a list of topics (ID and name) from the designated Supabase table.

  Performs an early DNS resolution check to give a clearer error message if the
  Supabase host cannot be resolved.
  """
  try:
    parsed = urlparse(SUPABASE_URL)
    host = parsed.hostname
    if host:
      print(f"Using SUPABASE_URL host: {host}")
      try:
        socket.getaddrinfo(host, None)
      except socket.gaierror as dns_err:
        print(f"!!! DNS resolution failed for host '{host}': {dns_err}")
        print("!!! Possible causes: incorrect SUPABASE_URL, no network, or DNS/proxy/firewall blocking")
        return []
  except Exception:
    # Continue and let the Supabase client surface the error if parsing fails
    pass

  try:
    response = supabase.table(INPUT_TABLE).select("id, topic").execute()
    data = getattr(response, 'data', None) or response
    if data is None:
      print(f"!!! Unexpected response from Supabase: {response}")
      return []

    print(f"✅ Found {len(data)} topics in Supabase table '{INPUT_TABLE}'.")
    return data
  except Exception as e:
    print(f"!!! Error connecting to Supabase or querying table: {e}")
    return []


def generate_lead_data(target_industry: str):
  """Calls the deployed Vercel API for a single topic."""
  encoded_industry = quote(target_industry)
  full_url = f"{VERCEL_API_URL}{ENDPOINT}?topic={encoded_industry}"

  print(f"-> Calling API for topic: '{target_industry}'")

  try:
    response = requests.get(full_url, timeout=45)
    response.raise_for_status()
    data = response.json()

    if not data.get('success'):
      print(f"!!! API Error (Success flag false): {data.get('message', 'Unknown error')}")
      return {"error": data.get('message', 'Generation failed.')}

    return data.get('generated_data')
  except requests.exceptions.RequestException as e:
    print(f"!!! HTTP Request Failed: {e}")
    return {"error": f"HTTP Request Failed: {e}"}


def save_result_to_supabase(topic_id: int, topic: str, generated_data: dict = None, error_msg: str = None):
  """Saves the structured result or error to the output Supabase table."""

  generated_uuid = str(uuid.uuid4())

  save_data = {
    "id": generated_uuid,
    "source_topic_id": topic_id,
    "source_topic": topic,
    "subject": (generated_data or {}).get('subject') if generated_data else None,
    "body_html": (generated_data or {}).get('body_html') if generated_data else None,
    "value_proposition": (generated_data or {}).get('value_proposition') if generated_data else None,
    "lead_role": (generated_data or {}).get('lead_profile', {}).get('role') if generated_data else None,
    "lead_challenge": (generated_data or {}).get('lead_profile', {}).get('primary_challenge') if generated_data else None,
    "lead_revenue": (generated_data or {}).get('lead_profile', {}).get('predicted_annual_revenue_usd') if generated_data else None,
    "status": "ERROR" if error_msg else "GENERATED",
    "error_message": error_msg,
  }

  try:
    resp = supabase.table(OUTPUT_TABLE).insert(save_data).execute()
    if getattr(resp, 'error', None) or (isinstance(resp, dict) and resp.get('error')):
      print(f"| Status: FAILED - Supabase error: {getattr(resp, 'error', resp)}")
      return False

    print(f"| Status: SUCCESS - Saved to '{OUTPUT_TABLE}'")
    return True
  except Exception as e:
    print(f"| Status: FAILED - Could not save result: {e}")
    return False


if __name__ == "__main__":
  print("=" * 50)
  print("🚀 Autoleadsa API & Supabase Integration Tool")
  print("=" * 50)

  topics_to_test = get_topics_from_supabase()

  if not topics_to_test:
    print("🛑 No topics retrieved. Check Supabase connection and table name.")
  else:
    for item in topics_to_test:
      topic_id = item.get('id')
      topic = item.get('topic') or item.get('name') or item.get('industry')

      print("-" * 30)
      print(f"Processing topic id={topic_id} topic={topic!r}")

      if not topic:
        print(f"🟡 Skipping topic id={topic_id}: no text field found ('topic'/'name'/'industry').")
        continue

      generated = generate_lead_data(topic)

      if isinstance(generated, dict) and generated.get('error'):
        error_msg = generated.get('error')
        print(f"⚠️ Generation error for topic id={topic_id}: {error_msg}")
        save_result_to_supabase(topic_id, topic, generated_data=None, error_msg=error_msg)
        continue

      ok = save_result_to_supabase(topic_id, topic, generated_data=generated)
      if not ok:
        print(f"| Warning: save_result_to_supabase returned False for topic id={topic_id}")