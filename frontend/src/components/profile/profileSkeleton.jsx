import "./profileSkeleton.css";

function ProfileSkeleton({ isMobile }) {
  return (
    <div className="profile-skeleton">
      <div className="profileInfo-skeleton">
        {/* Show only mobile skeleton if isMobile = true */}
        {isMobile ? (
          <div className="profileDetails-mobile-skeleton">
            <div className="profileDetailsHeader-mobile-skeleton">
              <div className="profilePic-mobile-skeleton skeleton"></div>
              <div className="profileDescHeader-mobile-skeleton">
                <div className="skeleton skeleton-username"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-settings-btn"></div>
              </div>
            </div>

            <div className="profileDetailsMiddle-mobile-skeleton">
              <div className="profileDescBio-mobile-skeleton">
                <div className="skeleton skeleton-bio"></div>
                <div className="skeleton skeleton-bio-short"></div>
              </div>
              <div className="mutualFollowers-mobile-skeleton">
                <div className="skeleton skeleton-mutual"></div>
              </div>
            </div>

            <div className="profileDetailsFooter-mobile-skeleton">
              <div className="profileDescSubHeader-mobile-skeleton">
                <div className="skeleton skeleton-stat"></div>
                <div className="skeleton skeleton-stat"></div>
                <div className="skeleton skeleton-stat"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Else show the desktop skeleton */
          <div className="profileDetails-skeleton">
            <div className="profilePic-skeleton skeleton"></div>
            <div className="profileDesc-skeleton">
              <div className="profileDescHeader-skeleton">
                <div className="skeleton skeleton-username"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-settings-btn"></div>
              </div>
              <div className="profileDescSubHeader-skeleton">
                <div className="skeleton skeleton-stat"></div>
                <div className="skeleton skeleton-stat"></div>
                <div className="skeleton skeleton-stat"></div>
              </div>
              <div className="profileDescBio-skeleton">
                <div className="skeleton skeleton-bio"></div>
                <div className="skeleton skeleton-bio-short"></div>
              </div>
              <div className="mutualFollowers-skeleton">
                <div className="skeleton skeleton-mutual"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSkeleton;
