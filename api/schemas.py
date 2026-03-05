from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ReservationCreate(BaseModel):
    name:   str
    email:  EmailStr
    phone:  Optional[str] = None
    date:   str
    time:   str
    guests: int
    notes:  Optional[str] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    notes:  Optional[str] = None

class ReservationOut(BaseModel):
    id:         int
    name:       str
    email:      str
    phone:      Optional[str]
    date:       str
    time:       str
    guests:     int
    notes:      Optional[str]
    status:     str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type:   str

class StatsOut(BaseModel):
    total:        int
    confirmed:    int
    cancelled:    int
    total_guests: int
