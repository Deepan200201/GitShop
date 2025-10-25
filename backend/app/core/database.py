from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# echo=True for debugging, can be turned off in prod
engine = create_engine(settings.DATABASE_URL, echo=False)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
