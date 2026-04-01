import os
import httpx
import random
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def _local_briefing(metrics: dict) -> str:
    """
    Generates a realistic, intensity-aware tactical briefing locally.
    Used as primary source OR fallback when Gemini API is rate-limited.
    """
    intensity = float(metrics.get("intensity", 25))
    hazard = str(metrics.get("hazard_type", "general")).upper()
    pop = int(metrics.get("affected_population", 0))
    risk = float(metrics.get("risk_score", 0))
    reduction = float(metrics.get("casualty_reduction", 0))

    pop_str = f"{pop:,}" if pop > 0 else "unknown"

    if intensity >= 80:
        level = "CRITICAL"
        escalation_phrases = [
            f"SHADOW MAP AI detects a CRITICAL {hazard} event at {intensity:.0f}% severity — cascade failure imminent across {pop_str} affected civilians.",
            f"MAXIMUM ALERT: {hazard} intensity at {intensity:.0f}% has triggered multi-node infrastructure collapse. Estimated {pop_str} lives at immediate risk.",
            f"AI Commander DEFCON 1: {hazard} event overwhelming response capacity at {intensity:.0f}%. Risk score {risk:.1f}/100 demands immediate field mobilization.",
        ]
        action_phrases = [
            f"Prioritize hospital backup power and evacuate within 2km radius. Casualty reduction target: {reduction:.0f}%.",
            f"Deploy all available ambulances to high-density zones immediately. Every 90-second delay increases casualties by an estimated 12%.",
            f"Activate emergency shelters and establish perimeter control. AI projects {reduction:.0f}% casualty reduction if response is deployed within 8 minutes.",
        ]
    elif intensity >= 50:
        level = "HIGH"
        escalation_phrases = [
            f"SHADOW MAP AI flags HIGH severity {hazard} event at {intensity:.0f}% — {pop_str} civilians in projected impact zone.",
            f"Elevated threat: {hazard} at {intensity:.0f}% intensity. Risk score {risk:.1f}/100. Infrastructure stress indicators rising.",
            f"AI Commander status HIGH: {hazard} event escalating. {pop_str} affected population requires active resource staging.",
        ]
        action_phrases = [
            f"Pre-position ambulances and rescue teams at priority nodes. AI projects {reduction:.0f}% casualty reduction with proactive deployment.",
            f"Initiate shelter-in-place advisories for vulnerable zones. Response window is approximately 24 minutes before escalation.",
            f"Coordinate hospital capacity and establish field triage points. Current risk trajectory suggests escalation within 15 minutes.",
        ]
    elif intensity >= 25:
        level = "MODERATE"
        escalation_phrases = [
            f"SHADOW MAP AI monitoring MODERATE {hazard} conditions at {intensity:.0f}%. {pop_str} in precautionary zone.",
            f"Developing situation: {hazard} at {intensity:.0f}% intensity. Early indicators suggest potential escalation in affected areas.",
            f"AI surveillance active: {hazard} event trending at {intensity:.0f}%. Recommend pre-staging resources for rapid deployment.",
        ]
        action_phrases = [
            f"Issue public advisories and verify emergency communication channels are active. Standby readiness recommended.",
            f"Audit hospital bed availability and fuel generator reserves. AI projects {reduction:.0f}% casualty reduction with early positioning.",
            f"Monitor infrastructure stress indicators closely; escalation probability is {risk:.0f}% over next 60 minutes.",
        ]
    else:
        level = "LOW"
        escalation_phrases = [
            f"SHADOW MAP AI: {hazard} conditions at {intensity:.0f}% — situation nominal. {pop_str} in monitored zone.",
            f"Low-risk monitoring active: {hazard} event at {intensity:.0f}% severity. No immediate threat detected.",
            f"AI Commander status: GREEN. {hazard} at {intensity:.0f}% — all systems nominal. Routine surveillance protocols in effect.",
        ]
        action_phrases = [
            f"Maintain current readiness posture and continue standard monitoring cycles.",
            f"Review and update emergency contact trees and verify all standby resources are available.",
            f"AI recommends routine infrastructure inspection during this low-activity window.",
        ]

    phrase1 = random.choice(escalation_phrases)
    phrase2 = random.choice(action_phrases)
    return f"{phrase1} {phrase2}"


class AIService:
    def __init__(self):
        if not GEMINI_API_KEY:
            print("[AI] WARNING: GEMINI_API_KEY not set. Using local briefing engine.")
        else:
            print(f"[AI] Gemini AI service initialized. Key: ...{GEMINI_API_KEY[-6:]}")

    async def generate_tactical_briefing(self, metrics: dict) -> str:
        """
        Generates a tactical briefing. Attempts Gemini API first;
        falls back to the local intensity-aware engine on any error.
        """
        # Try Gemini API if key is available
        if GEMINI_API_KEY:
            intensity = float(metrics.get("intensity", 25))
            hazard = str(metrics.get("hazard_type", "general")).upper()
            pop = int(metrics.get("affected_population", 0))
            risk = float(metrics.get("risk_score", 0))
            reduction = float(metrics.get("casualty_reduction", 0))

            prompt = (
                f"You are SHADOW MAP AI Commander, a tactical intelligence system for disaster response. "
                f"Give a concise strategic briefing in exactly 2 sentences. Be urgent, authoritative, and specific to these numbers.\n\n"
                f"Intensity: {intensity:.0f}% | Hazard: {hazard}\n"
                f"Affected Population: {pop:,} | Risk Score: {risk:.1f}/100 | Casualty Reduction Forecast: {reduction:.1f}%\n\n"
                f"Start with urgency level. End with the single most critical action needed right now."
            )

            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.85, "maxOutputTokens": 120}
            }

            try:
                async with httpx.AsyncClient(timeout=15.0) as client:
                    response = await client.post(
                        f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    data = response.json()
                    print(f"[AI] Gemini status: {response.status_code}")

                    if "error" in data:
                        code = data["error"].get("code", 0)
                        print(f"[AI] Gemini error {code}: {data['error'].get('message')} — using local engine")
                        return _local_briefing(metrics)

                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0]["content"]["parts"][0]["text"]
                        return text.strip()
                    
                    print("[AI] No candidates — using local engine")
                    return _local_briefing(metrics)

            except Exception as e:
                print(f"[AI] Exception: {type(e).__name__}: {e} — using local engine")
                return _local_briefing(metrics)

        # No API key — use local engine
        return _local_briefing(metrics)

    async def generate_briefing_text(self, prompt: str) -> str:
        """
        Generic method: sends a raw prompt to Gemini and returns the text.
        Falls back to a simple local message on any error.
        """
        if not GEMINI_API_KEY:
            raise Exception("No API key")

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.80, "maxOutputTokens": 180}
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            data = response.json()
            if "error" in data:
                raise Exception(f"Gemini error: {data['error'].get('message')}")
            candidates = data.get("candidates", [])
            if candidates:
                return candidates[0]["content"]["parts"][0]["text"].strip()
            raise Exception("No candidates in Gemini response")


ai_service = AIService()
