from typing import List
from fastapi import APIRouter, HTTPException, Depends
from app.models.review import Review, ReviewCreate
from app.models.user import User
from app.api import deps
from app.services.review_service import review_service
from sqlmodel import Session
from app.core.database import get_session

router = APIRouter()

@router.post("/", response_model=Review)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(get_session)
):
    review = review_service.create_review(db, review_in, current_user.id, current_user.full_name or "Anonymous")
    if not review:
        raise HTTPException(status_code=400, detail="Please buy the product to give review")
    return review

@router.get("/{product_id}", response_model=List[Review])
def list_reviews(product_id: str, db: Session = Depends(get_session)):
    return review_service.list_reviews(db, product_id)
