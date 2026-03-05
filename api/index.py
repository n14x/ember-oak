from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
import bcrypt
import os
import sys

# Make sure local modules are importable
sys.path.insert(0, os.path.dirname(__file__))

from database import get_db, engine
import models
import schemas

# Create tables on cold start
models.Base.metadata.create_all(bind=engine)

SECRET_KEY = os.environ.get("SECRET_KEY", "ember-oak-dev-secret-2024")

app = FastAPI(title="Ember & Oak API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/index/admin/login")


# ─── AUTH UTILITIES ───────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def get_current_admin(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    admin = db.query(models.Admin).filter(models.Admin.username == username).first()
    if not admin:
        raise HTTPException(status_code=401, detail="Admin not found")
    return admin


# ─── PUBLIC ROUTES ────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Ember & Oak API is running 🔥"}


@app.post("/reservations", response_model=schemas.ReservationOut, status_code=201)
def create_reservation(payload: schemas.ReservationCreate, db: Session = Depends(get_db)):
    reservation = models.Reservation(**payload.dict(), status="confirmed")
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


# ─── ADMIN AUTH ───────────────────────────────────────────────────

@app.post("/admin/login", response_model=schemas.TokenOut)
def admin_login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    admin = db.query(models.Admin).filter(models.Admin.username == form.username).first()
    if not admin or not verify_password(form.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token({"sub": admin.username}), "token_type": "bearer"}


@app.post("/admin/seed", status_code=201)
def seed_admin(db: Session = Depends(get_db)):
    existing = db.query(models.Admin).filter(models.Admin.username == "admin").first()
    if existing:
        return {"message": "Admin already exists"}
    admin = models.Admin(username="admin", hashed_password=hash_password("ember2024"))
    db.add(admin)
    db.commit()
    return {"message": "Admin created", "username": "admin", "password": "ember2024"}


# ─── ADMIN PROTECTED ROUTES ───────────────────────────────────────

@app.get("/admin/reservations", response_model=List[schemas.ReservationOut])
def list_reservations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(get_current_admin),
):
    q = db.query(models.Reservation)
    if status:
        q = q.filter(models.Reservation.status == status)
    return q.order_by(models.Reservation.created_at.desc()).all()


@app.patch("/admin/reservations/{res_id}", response_model=schemas.ReservationOut)
def update_reservation(
    res_id: int,
    payload: schemas.ReservationUpdate,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(get_current_admin),
):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(res, field, value)
    db.commit()
    db.refresh(res)
    return res


@app.delete("/admin/reservations/{res_id}", status_code=204)
def delete_reservation(
    res_id: int,
    db: Session = Depends(get_db),
    _: models.Admin = Depends(get_current_admin),
):
    res = db.query(models.Reservation).filter(models.Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(res)
    db.commit()


@app.get("/admin/stats", response_model=schemas.StatsOut)
def get_stats(
    db: Session = Depends(get_db),
    _: models.Admin = Depends(get_current_admin),
):
    total = db.query(models.Reservation).count()
    confirmed = db.query(models.Reservation).filter(models.Reservation.status == "confirmed").count()
    cancelled = db.query(models.Reservation).filter(models.Reservation.status == "cancelled").count()
    guests = sum(r.guests for r in db.query(models.Reservation).all())
    return {"total": total, "confirmed": confirmed, "cancelled": cancelled, "total_guests": guests}


# Vercel handler
handler = app
