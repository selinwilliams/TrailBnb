import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import "./SpotDetails.css";
import {
  getSpotReviewsThunk,
  getSpotsDetailsThunk,
} from "../../../store/spots";
import PostReviewModal from "./PostReview";
import OpenModalButton from "../../../components/OpenModalButton/OpenModalButton";
import DeleteReviewModal from "./DeleteReviewModal";

export default function SpotDetails() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const spot = useSelector((state) => state.spots.spotDetails);
  const reviews = useSelector((state) => state.spots.allReviews);
  const sessionUser = useSelector((state) => state.session.user);
  // const { closeModal } = useModal();

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const getData = async () => {
      await dispatch(getSpotsDetailsThunk(id));
      await dispatch(getSpotReviewsThunk(id));
      setIsLoaded(true);
    };
    // getData()
    // if( !spot) {
    getData();
    // }
  }, [dispatch, id, isLoaded]);


  useEffect(() =>{
    if (sessionUser){
      const userReviewed = reviews.some(review => review.userId === sessionUser.id);
      // console.log(reviews)
      setHasReviewed(userReviewed); 
    }
  }, [reviews, sessionUser]);
  

  if (!spot) {
    return <div>loading...</div>;
  }

  const handleReserve = () => {
    alert("Feature coming soon");
  };

  const isUserOwner = () => {
    // if the session user is not the spot owner, return true. otherwise return false.
    if (sessionUser.id !== spot.Owner.id) {
      return true;
    } else {
      return false;
    }
  };

  const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${month} ${year}`;
  };

  const reverseReviews = reviews.slice().reverse();
  const previewImage = spot.SpotImages.find((image) => image.preview);
  const otherImages = spot.SpotImages.filter((image) => !image.preview);
  return (
    <div className="spotDetails">
      <div>
        <h2>{spot.name}</h2>
        <p>
          {spot.city}, {spot.state}, {spot.country}
        </p>
      </div>
      <div className="images">
        <div>
         {previewImage && (
            <img className='preview-img' src={previewImage.url} alt="Preview" />
          )}
        </div>
        <div>
          <div className="small-img-row-1">
            {otherImages.slice(0, 2).map((image, idx) => (
              <img key={idx} className='small-img' src={image.url} alt={`Image ${idx + 1}`} />
            ))}
            {/* <img
              className="small-img"
              src={
                isLoaded && spot.SpotImages[2] ? spot.SpotImages[2].url : null
              }
            /> */}
          </div>

          <div className="small-img-row-2">
          {otherImages.slice(2).map((image, idx) => (
              <img key={idx + 2} className='small-img' src={image.url} alt={`Image ${idx + 3}`} />
            ))}
            {/* <img
              className="small-img"
              src={
                isLoaded && spot.SpotImages[4] ? spot.SpotImages[4].url : null
              }
            /> */}
          </div>
        </div>
      </div>
      <div className="spotDetailsInfo">
        <div>
          <h2>
            Hosted by {spot.Owner.firstName} {spot.Owner.lastName}
          </h2>
          <p>{spot.description}</p>
        </div>
        <div className="spotDetailsReserve">
          <div className="spotDetailsPriceAndRev">
            <span>
              <span className="spotPrice">${spot.price} </span>
              <span> night</span>
            </span>
            <span className="starRating"><FaStar />{spot.avgRating ? spot.avgRating.toFixed(1) : "New"}
            </span>
          </div>
          <button className="reserveButton" onClick={handleReserve}>
            Reserve
          </button>
        </div>
      </div>
      <div>
        <h2>
          <FaStar />{" "}
          {spot.numReviews === 0
            ? "New"
            : `${spot.avgStarRating.toFixed(1)} · ${
                spot.numReviews === 1
                  ? `${spot.numReviews} Review`
                  : `${spot.numReviews} Reviews`
              }`}
        </h2>
      </div>

      {sessionUser &&
      sessionUser.id !== spot.Owner.id &&
      hasReviewed === false ? (
        <div className="post-review-button">
          <OpenModalButton
            buttonText={"Post your review"}
            modalComponent={<PostReviewModal spotId={id} />}
            preventDefault
            stopPropagation
          />
        </div>
      ) : (
        ""
      )}

      <div>
        {isUserOwner && !spot.numReviews ? (
          "Be the first to post a review!"
        ) : (
          <ul className="reviews">
            {reverseReviews.map((review, idx) => (
              <li key={`${idx}-${review.id}`}>
                <h3 className="reviewUserName">{review.User.firstName}</h3>
                <p>{formatDateString(review.createdAt)}</p>
                <p>{review.review}</p>
                {sessionUser && review.User.id === sessionUser.id ? (
                  <div className="delete-review-button">
                    <OpenModalButton
                      buttonText={"Delete"}
                      modalComponent={
                        <DeleteReviewModal
                          review={review}
                          setHasReviewed={setHasReviewed}
                        />
                      }
                      preventDefault
                      stopPropagation
                    />
                  </div>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
