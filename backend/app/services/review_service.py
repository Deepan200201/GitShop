from typing import List, Optional
from sqlmodel import Session, select
from app.models.review import Review, ReviewCreate
from app.models.order import Order, OrderItem
from datetime import datetime

class ReviewService:
    def create_review(self, db: Session, review_in: ReviewCreate, user_id: str, user_name: str) -> Optional[Review]:
        # 1. Verify Purchase
        # Check if user has an order with this product
        statement = select(OrderItem).join(Order).where(
            Order.user_id == user_id,
            OrderItem.product_id == review_in.product_id
        )
        has_purchased = db.exec(statement).first()
        
        if not has_purchased:
            return None # Or raise exception in caller
            
        # 2. Check for existing review (Upsert)
        statement = select(Review).where(
            Review.product_id == review_in.product_id,
            Review.user_id == user_id
        )
        existing_review = db.exec(statement).first()
        
        if existing_review:
            # Update
            existing_review.rating = review_in.rating
            existing_review.comment = review_in.comment
            existing_review.images = review_in.images
            # existing_review.created_at = datetime.utcnow() # Optional: update timestamp?
            db.add(existing_review)
            db.commit()
            db.refresh(existing_review)
            return existing_review
        else:
            # Create
            review = Review(
                **review_in.dict(), 
                user_id=user_id,
                user_name=user_name
            )
            db.add(review)
            db.commit()
            db.refresh(review)
            return review

    def list_reviews(self, db: Session, product_id: str) -> List[Review]:
        statement = select(Review).where(Review.product_id == product_id).order_by(Review.created_at.desc())
        return db.exec(statement).all()

review_service = ReviewService()
