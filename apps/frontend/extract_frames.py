import cv2
import os

# Define paths
video_path = "public/assets/sequence.mp4"
output_dir = "public/assets/hero-sequence"

# Create output directory
os.makedirs(output_dir, exist_ok=True)

# Open video
cap = cv2.VideoCapture(video_path)

if not cap.isOpened():
    print(f"Error: Could not open video at {video_path}")
    exit(1)

# Get video properties
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)
duration = total_frames / fps if fps > 0 else 0

print(f"Video Loaded: {width}x{height}, {total_frames} frames, {fps:.2f} FPS, {duration:.2f} seconds duration")

# Target settings
target_frames = 300
target_width = 1280
target_height = 720

# Calculate frames extraction step
step = total_frames / target_frames if total_frames > target_frames else 1.0

print(f"Extracting {target_frames} frames to WebP format ({target_width}x{target_height}) directly...")

frame_id = 0
extracted_count = 0

while extracted_count < target_frames:
    # Calculate the source frame index to read
    source_frame_idx = int(round(extracted_count * step))
    if source_frame_idx >= total_frames:
        break
        
    cap.set(cv2.CAP_PROP_POS_FRAMES, source_frame_idx)
    ret, frame = cap.read()
    
    if not ret:
        break
        
    # Resize frame to target dimensions for optimal canvas performance
    resized_frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_AREA)
    
    # Save directly as WebP with 80% quality compression
    output_path = os.path.join(output_dir, f"{extracted_count}.webp")
    cv2.imwrite(output_path, resized_frame, [cv2.IMWRITE_WEBP_QUALITY, 80])
    
    extracted_count += 1
    if extracted_count % 30 == 0:
        print(f"Progress: {extracted_count}/{target_frames} frames saved...")

cap.release()

print(f"Success! Extracted {extracted_count} WebP frames into '{output_dir}' directory.")
