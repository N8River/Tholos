export function getAspectRatioClass(width, height) {
  const aspectRatio = width / height;
  // console.log("Image width:", width);
  // console.log("Image height:", height);

  if (aspectRatio === 1) {
    return "aspect-ratio-1-1"; // Square
  } else if (aspectRatio > 1.5) {
    return "aspect-ratio-16-9"; // Landscape 16:9
  } else if (aspectRatio > 1.3) {
    return "aspect-ratio-4-3"; // Portrait 4:3
  } else {
    return "aspect-ratio-3-4"; // Portrait 3:4
  }
}
