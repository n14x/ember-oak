from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Reservation(Base):
    __tablename__ = "reservations"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    phone      = Column(String, nullable=True)
    date       = Column(String, nullable=False)
    time       = Column(String, nullable=False)
    guests     = Column(Integer, nullable=False)
    notes      = Column(String, nullable=True)
    status     = Column(String, default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

class Admin(Base):
    __tablename__ = "admins"
    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)
