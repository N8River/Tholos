import "./comment.css";

function Comment({ comment }) {
  console.log("🔴 Comment", comment);

  return (
    <>
      <div className="comment">
        <div className="commentUserAvatar">
          <img src={comment.user.avatar} alt="" />
        </div>
        <strong>{comment.user.userName}</strong>
        <p>{comment.text}</p>
      </div>
    </>
  );
}

export default Comment;
