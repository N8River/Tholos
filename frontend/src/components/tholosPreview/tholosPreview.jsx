import "./tholosPreview.css";

import SmartPhoneOverlayImg1 from "../../assets/pictures/SmartPhoneOverlayImg1.png";
import SmartPhoneOverlayImg2 from "../../assets/pictures/SmartPhoneOverlayImg2.png";
import SmartPhoneOverlayImg3 from "../../assets/pictures/SmartPhoneOverlayImg3.png";
import SmartPhoneOverlayImg4 from "../../assets/pictures/SmartPhoneOverlayImg4.png";

import { useEffect, useState } from "react";

function TholosPreview() {
  const slideshowImages = [
    SmartPhoneOverlayImg1,
    SmartPhoneOverlayImg2,
    SmartPhoneOverlayImg3,
  ];

  const staticImage = SmartPhoneOverlayImg4;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false); // Start fading out
      setTimeout(() => {
        setCurrentIndex(
          (prevIndex) => (prevIndex + 1) % slideshowImages.length
        );
        setFadeIn(true); // Fade back in with the new image
      }, 750); // Image change after the fade-out
    }, 5000); // 5 seconds before switching images

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tholosPreview">
      <div className="tholosPreviewImgWrapper">
        <img
          className="staticImageTholosPreview"
          src={staticImage}
          alt="Static Background"
        />
      </div>
      <div className="tholosPreviewSlideshowWrapper">
        {slideshowImages.map((image, index) => (
          <img
            key={index}
            className={`slideshowTholosPreview ${
              currentIndex === index ? "fade-in" : "fade-out"
            }`}
            src={image}
            alt={`Slideshow ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default TholosPreview;
