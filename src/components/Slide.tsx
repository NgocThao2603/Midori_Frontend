import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";

type SlideProps = {
  images: string[];
  variant?: "shadow" | "plain";
};

export const Slide = ({ images, variant = "shadow" }: SlideProps) => {
  const swiperClass = variant === "shadow" 
    ? "rounded-xl shadow-lg h-full [&_.swiper-button-next]:text-green_pastel [&_.swiper-button-prev]:text-green_pastel"
    : "rounded-xl h-full [&_.swiper-button-next]:hidden [&_.swiper-button-prev]:hidden";

  const imageClass = variant === "shadow"
    ? "rounded-xl shadow-lg w-full h-full object-cover cursor-pointer"
    : "rounded-xl w-full h-full object-cover cursor-pointer";

  return (
    <Swiper
      modules={[Autoplay, Navigation]}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}
      navigation
      className={swiperClass}
    >
      {images.map((image, index) => (
        <SwiperSlide key={index} onClick={(e) => e.stopPropagation()}>
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className={imageClass}
            onClick={(e) => {
              e.stopPropagation();
              const swiperContainer = e.currentTarget.closest(".swiper"); 
              const nextButton = swiperContainer?.querySelector(".swiper-button-next") as HTMLElement;
              nextButton?.click(); 
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
