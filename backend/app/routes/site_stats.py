from fastapi import APIRouter, Request
from app.database.supabase_client import supabase
from hashlib import sha256
from datetime import datetime, timedelta

router = APIRouter(prefix="/stats", tags=["Site Stats"])

COOLDOWN_MINUTES = 30


# ======================================================
# REGISTRAR VISITA (COM COOLDOWN)
# ======================================================
@router.post("/visit")
def register_visit(request: Request):
    # 1) Identificar visitante (IP → hash)
    ip = request.client.host
    ip_hash = sha256(ip.encode()).hexdigest()

    now = datetime.utcnow()
    limit_time = now - timedelta(minutes=COOLDOWN_MINUTES)

    # 2) Verifica se já houve visita recente
    recent = (
        supabase.table("site_visits")
        .select("id")
        .eq("ip_hash", ip_hash)
        .gte("visited_at", limit_time.isoformat())
        .execute()
    )

    if recent.data:
        # visita ignorada (cooldown ativo)
        res = (
            supabase.table("site_stats")
            .select("total_visits")
            .eq("id", 1)
            .single()
            .execute()
        )
        return {
            "total_visits": res.data["total_visits"] if res.data else 0,
            "ignored": True
        }

    # 3) Registra visita
    supabase.table("site_visits").insert({
        "ip_hash": ip_hash,
        "visited_at": now.isoformat()
    }).execute()

    # 4) Incrementa contador global
    res = (
        supabase.table("site_stats")
        .select("total_visits")
        .eq("id", 1)
        .single()
        .execute()
    )

    current = res.data["total_visits"] if res.data else 0
    new_total = current + 1

    supabase.table("site_stats") \
        .update({"total_visits": new_total}) \
        .eq("id", 1) \
        .execute()

    return {"total_visits": new_total}


# ======================================================
# OBTER TOTAL DE VISITAS
# ======================================================
@router.get("/visits")
def get_visits():
    res = (
        supabase.table("site_stats")
        .select("total_visits")
        .eq("id", 1)
        .single()
        .execute()
    )

    return {"total_visits": res.data["total_visits"] if res.data else 0}
