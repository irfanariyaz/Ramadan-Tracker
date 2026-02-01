from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import date, datetime
from datetime import date, datetime, timedelta
from typing import List
import os
import calendar

import models
import schemas
import crud
import prayer_times
import file_upload
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Ramadan Daily Tracker API")

# Create static directory for photos
os.makedirs("static/photos", exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
allowed_origins = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Ramadan Daily Tracker API", "version": "1.0.0"}


# Family Endpoints
@app.post("/api/families", response_model=schemas.FamilyResponse)
def create_family(family: schemas.FamilyCreate, db: Session = Depends(get_db)):
    """Create a new family"""
    db_family = crud.get_family_by_name(db, family.name)
    if db_family:
        raise HTTPException(status_code=400, detail="Family name already exists")
    return crud.create_family(db, family)


@app.get("/api/families", response_model=List[schemas.FamilyResponse])
def get_families(db: Session = Depends(get_db)):
    """Get all families"""
    return crud.get_all_families(db)


@app.get("/api/families/{family_id}", response_model=schemas.FamilyResponse)
def get_family(family_id: int, db: Session = Depends(get_db)):
    """Get a specific family"""
    db_family = crud.get_family(db, family_id)
    if not db_family:
        raise HTTPException(status_code=404, detail="Family not found")
    return db_family


@app.put("/api/families/{family_id}", response_model=schemas.FamilyResponse)
def update_family(family_id: int, family: schemas.FamilyUpdate, db: Session = Depends(get_db)):
    """Update a family's information"""
    db_family = crud.get_family(db, family_id)
    if not db_family:
        raise HTTPException(status_code=404, detail="Family not found")
    return crud.update_family(db, family_id, family)


@app.delete("/api/families/{family_id}")
def delete_family(family_id: int, db: Session = Depends(get_db)):
    """Delete a family and all its members"""
    db_family = crud.get_family(db, family_id)
    if not db_family:
        raise HTTPException(status_code=404, detail="Family not found")
    crud.delete_family(db, family_id)
    return {"message": "Family deleted successfully"}


# Family Member Endpoints
@app.post("/api/members", response_model=schemas.MemberResponse)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    """Create a new family member"""
    # Verify family exists
    db_family = crud.get_family(db, member.family_id)
    if not db_family:
        raise HTTPException(status_code=404, detail="Family not found")
    return crud.create_member(db, member)


@app.get("/api/families/{family_id}/members", response_model=List[schemas.MemberResponse])
def get_family_members(family_id: int, db: Session = Depends(get_db)):
    """Get all members of a family"""
    return crud.get_family_members(db, family_id)


@app.get("/api/members/{member_id}", response_model=schemas.MemberResponse)
def get_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific family member"""
    db_member = crud.get_member(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member


@app.put("/api/members/{member_id}", response_model=schemas.MemberResponse)
def update_member(member_id: int, member: schemas.MemberUpdate, db: Session = Depends(get_db)):
    """Update a member's information"""
    db_member = crud.get_member(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    return crud.update_member(db, member_id, member)


@app.delete("/api/members/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db)):
    """Delete a family member"""
    db_member = crud.get_member(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    crud.delete_member(db, member_id)
    return {"message": "Member deleted successfully"}


@app.post("/api/members/{member_id}/photo")
async def upload_member_photo(member_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a photo for a family member"""
    db_member = crud.get_member(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    # Delete old photo if exists
    if db_member.photo_path:
        file_upload.delete_file(db_member.photo_path)
    
    # Save new photo
    photo_path = await file_upload.save_upload_file(file)
    
    # Update member record
    updated_member = crud.update_member_photo(db, member_id, photo_path)
    
    return {"message": "Photo uploaded successfully", "photo_path": photo_path}


# Custom Checklist Item Endpoints
@app.post("/api/custom-items", response_model=schemas.CustomChecklistItemResponse)
def create_custom_item(item: schemas.CustomChecklistItemCreate, db: Session = Depends(get_db)):
    """Create a custom checklist item for a member"""
    db_member = crud.get_member(db, item.member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    return crud.create_custom_item(db, item)


@app.get("/api/members/{member_id}/custom-items", response_model=List[schemas.CustomChecklistItemResponse])
def get_member_custom_items(member_id: int, active_only: bool = True, db: Session = Depends(get_db)):
    """Get all custom checklist items for a member"""
    return crud.get_custom_items(db, member_id, active_only)


@app.put("/api/custom-items/{item_id}", response_model=schemas.CustomChecklistItemResponse)
def update_custom_item(item_id: int, item_update: schemas.CustomChecklistItemUpdate, db: Session = Depends(get_db)):
    """Update a custom checklist item"""
    db_item = crud.get_custom_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Custom item not found")
    return crud.update_custom_item(db, item_id, item_update)


@app.delete("/api/custom-items/{item_id}")
def delete_custom_item(item_id: int, db: Session = Depends(get_db)):
    """Soft delete a custom checklist item"""
    db_item = crud.get_custom_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Custom item not found")
    crud.delete_custom_item(db, item_id)
    return {"message": "Custom item deleted successfully"}


# Daily Entry Endpoints
@app.get("/api/daily-stats/{member_id}", response_model=schemas.DailyEntryResponse)
def get_daily_stats(member_id: int, entry_date: date = None, db: Session = Depends(get_db)):
    """Get daily stats for a member"""
    if entry_date is None:
        entry_date = date.today()
    
    db_entry = crud.get_daily_entry(db, member_id, entry_date)
    if not db_entry:
        # Return default entry if none exists
        return schemas.DailyEntryResponse(
            id=0,
            member_id=member_id,
            date=entry_date,
            fasting_status="not_fasting",
            fajr=False,
            dhuhr=False,
            asr=False,
            maghrib=False,
            isha=False,
            taraweeh=False,
            quran_juz=0,
            quran_page=0,
            daily_goal=None,
            custom_items={},
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    return db_entry


@app.post("/api/update-entry", response_model=schemas.DailyEntryResponse)
def update_entry(
    member_id: int,
    entry_date: date,
    entry: schemas.DailyEntryUpdate,
    db: Session = Depends(get_db)
):
    """Update or create a daily entry"""
    db_member = crud.get_member(db, member_id)
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    return crud.update_daily_entry(db, member_id, entry_date, entry)


# Family Progress Endpoint
@app.get("/api/family-progress/{family_id}", response_model=schemas.FamilyProgressResponse)
def get_family_progress(family_id: int, entry_date: date = None, db: Session = Depends(get_db)):
    """Get progress for all family members on a specific date"""
    try:
        if entry_date is None:
            entry_date = date.today()
        
        db_family = crud.get_family(db, family_id)
        if not db_family:
            raise HTTPException(status_code=404, detail="Family not found")
        
        members = crud.get_family_members(db, family_id)
        member_progress = []
        
        for member in members:
            entry = crud.get_daily_entry(db, member.id, entry_date)
            
            custom_items_completed = 0
            custom_items_total = 0
            
            # Fetch active custom items for the member
            active_items = crud.get_custom_items(db, member.id, active_only=True)
            custom_items_total = len(active_items)
            
            if entry:
                # Count completed prayers (handle None values with or False)
                prayers_completed = sum([
                    entry.fajr or False, entry.dhuhr or False, entry.asr or False,
                    entry.maghrib or False, entry.isha or False, entry.taraweeh or False
                ])
                
                # Calculate Quran progress percentage (based on 30 Juz)
                quran_juz = entry.quran_juz or 0
                quran_progress = int((quran_juz / 30) * 100) if quran_juz > 0 else 0
                
                # Calculate Custom Items progress
                entry_custom_items = entry.custom_items or {}
                if custom_items_total > 0:
                    for item in active_items:
                        # Check if item ID matches a true value in entry custom items
                        if entry_custom_items.get(str(item.id)) is True:
                            custom_items_completed += 1
                
                member_progress.append(schemas.MemberProgress(
                    member_id=member.id,
                    member_name=member.name,
                    photo_path=member.photo_path,
                    fasting_status=entry.fasting_status or "not_fasting",
                    prayers_completed=prayers_completed,
                    quran_progress=quran_progress,
                    daily_goal=entry.daily_goal,
                    custom_items_completed=custom_items_completed,
                    custom_items_total=custom_items_total
                ))
            else:
                # Default values if no entry exists
                member_progress.append(schemas.MemberProgress(
                    member_id=member.id,
                    member_name=member.name,
                    photo_path=member.photo_path,
                    fasting_status="not_fasting",
                    prayers_completed=0,
                    quran_progress=0,
                    daily_goal=None,
                    custom_items_completed=0,
                    custom_items_total=custom_items_total
                ))
        
        return schemas.FamilyProgressResponse(
            family_id=family_id,
            family_name=db_family.name,
            date=entry_date,
            members=member_progress
        )
    except Exception as e:
        print(f"Error in get_family_progress: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# Prayer Times Endpoint
@app.get("/api/prayer-times", response_model=schemas.PrayerTimesResponse)
async def get_prayer_times_endpoint(
    entry_date: date = None,
    city: str = None,
    country: str = None,
    latitude: str = None,
    longitude: str = None,
    db: Session = Depends(get_db)
):
    """Get prayer times for a specific date and location"""
    if entry_date is None:
        entry_date = date.today()
    
    return await prayer_times.get_prayer_times(
        db, entry_date, city, country, latitude, longitude
    )


# Monthly Stats Endpoint
@app.get("/api/family/{family_id}/monthly-stats", response_model=schemas.MonthlyStatsResponse)
def get_monthly_stats(family_id: int, month: str = None, db: Session = Depends(get_db)):
    if not month:
        month = date.today().strftime("%Y-%m")
    
    try:
        year, month_num = map(int, month.split('-'))
        num_days = calendar.monthrange(year, month_num)[1]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid month format. Use YYYY-MM")

    # Get all family members
    members = crud.get_family_members(db, family_id)
    if not members:
        raise HTTPException(status_code=404, detail="Family not found")

    stats = []
    
    # Iterate through each day of the month
    for day in range(1, num_days + 1):
        current_date = date(year, month_num, day)
        
        # Get entries for this date
        entries = crud.get_family_daily_entries(db, family_id, current_date)
        
        member_daily_scores = []
        daily_total_score = 0
        fasting_count = 0
        
        for entry in entries:
            # Find the member details (could be optimized with a map, but N is small)
            member_details = next((m for m in members if m.id == entry.member_id), None)
            if not member_details:
                continue

            # Score Calculation (Daily)
            score = 0
            
            # Fasting (10 pts)
            if entry.fasting_status == "fasting":
                score += 10
                fasting_count += 1
            
            # Prayers (2 pts each)
            prayers_count = sum([
                entry.fajr or False, entry.dhuhr or False, entry.asr or False,
                entry.maghrib or False, entry.isha or False, entry.taraweeh or False
            ])
            score += (prayers_count * 2)
            
            # Custom Items (2 pts each)
            if entry.custom_items:
                # Count true values
                custom_count = sum(1 for v in entry.custom_items.values() if v is True)
                score += (custom_count * 2)
                
            # Daily Goal (5 pts)
            if entry.daily_goal:
                score += 5
                
            daily_total_score += score

            member_daily_scores.append(schemas.MemberDailyScore(
                member_id=entry.member_id,
                member_name=member_details.name,
                role=member_details.role,
                score=score,
                fasting_status=entry.fasting_status or "not_fasting"
            ))
            
        # Average score for the family (still useful for general color coding)
        avg_score = daily_total_score / len(members) if members else 0
        
        stats.append(schemas.DailySummary(
            date=current_date,
            total_score=avg_score,
            members_scores=member_daily_scores,
            fasting_count=fasting_count
        ))

    return schemas.MonthlyStatsResponse(
        family_id=family_id,
        month=month,
        dates=stats
    )


# Leaderboard Endpoint
@app.get("/api/family/{family_id}/leaderboard", response_model=schemas.LeaderboardResponse)
def get_leaderboard(family_id: int, db: Session = Depends(get_db)):
    members = crud.get_family_members(db, family_id)
    if not members:
        raise HTTPException(status_code=404, detail="Family not found")
        
    leaderboard_entries = []
    
    for member in members:
        # Get all entries for member
        entries = db.query(models.DailyEntry).filter(models.DailyEntry.member_id == member.id).all()
        
        total_score = 0
        fasting_total = 0
        max_quran_page = 0
        
        # Calculate streaks and totals
        # Sort entries by date
        sorted_entries = sorted(entries, key=lambda x: x.date)
        
        streak_counter = 0
        for entry in sorted_entries:
            if entry.fasting_status == "fasting":
                streak_counter += 1
                fasting_total += 1
            else:
                # partial streak reset logic or strict? Simple strict logic:
                if entry.fasting_status != "excused":
                   streak_counter = 0
        current_streak = streak_counter
        
        # Calculate Score
        for entry in entries:
            # Fasting
            if entry.fasting_status == "fasting":
                total_score += 10
            
            # Prayers
            prayers_count = sum([
                entry.fajr or False, entry.dhuhr or False, entry.asr or False,
                entry.maghrib or False, entry.isha or False, entry.taraweeh or False
            ])
            total_score += (prayers_count * 2)
            
            # Custom Items
            if entry.custom_items:
                custom_count = sum(1 for v in entry.custom_items.values() if v is True)
                total_score += (custom_count * 2)
                
            # Daily Goal
            if entry.daily_goal:
                total_score += 5
                
            # Track max quran page
            if entry.quran_page and entry.quran_page > max_quran_page:
                max_quran_page = entry.quran_page
        
        # Quran Score (Based on Role and Total Pages)
        quran_points_per_page = 10 if member.role == "child" else 2
        total_score += (max_quran_page * quran_points_per_page)
        
        leaderboard_entries.append(schemas.LeaderboardEntry(
            member_id=member.id,
            member_name=member.name,
            role=member.role,
            photo_path=member.photo_path,
            total_score=total_score,
            fasting_streak=current_streak,
            fasting_total=fasting_total,
            quran_pages_total=max_quran_page
        ))
    
    # Sort by total_score descending
    leaderboard_entries.sort(key=lambda x: x.total_score, reverse=True)
    
    return schemas.LeaderboardResponse(
        family_id=family_id,
        entries=leaderboard_entries
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
