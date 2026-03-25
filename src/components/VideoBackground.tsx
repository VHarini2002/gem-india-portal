const VideoBackground = () => {
  return (
    <div className="video-bg">
      <video autoPlay loop muted playsInline>
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoBackground;
