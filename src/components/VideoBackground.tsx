import { useTheme } from '@/contexts/ThemeContext';

const VideoBackground = () => {
  const { isDarkTheme } = useTheme();
  
  return (
    <div 
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: isDarkTheme ? '#0F131D' : '#F6F8FC' }}
    >
      <video 
        autoPlay 
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: isDarkTheme ? 0.28 : 0.14 }}
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      {/* Overlay to ensure text readability */}
      <div 
        className="absolute inset-0"
        style={{
          background: isDarkTheme
            ? 'linear-gradient(135deg, rgba(15, 19, 29, 0) 0%, rgba(15, 19, 29, 0) 50%, rgba(15, 19, 29, 0) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0) 0%, rgba(245, 247, 251, 0) 50%, rgba(255, 255, 255, 0) 100%)'
        }}
      />
    </div>
  );
};

export default VideoBackground;
