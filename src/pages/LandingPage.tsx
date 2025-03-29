import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeatureButton from "../components/home/FeatureButton";
import { Book, Pencil, Headphones, FileText } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/swiper-bundle.css";
import flashcard from "../assets/flashcard.png";
import practice from "../assets/practice.png";
import test from "../assets/test.png";
import Header from "../components/Header";

const images1 = [flashcard, practice, test];
const images2 = [flashcard, practice];
const images3 = [flashcard, practice, test];
const images4 = [flashcard];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();
    
      const headerHeight = 248;
      const sections = Array.from(document.querySelectorAll("section"));
      const currentScroll = window.scrollY;
    
      let currentSectionIndex = sections.findIndex(
        (section) => section.offsetTop - headerHeight >= currentScroll
      );
    
      if (currentSectionIndex > 0 && sections[currentSectionIndex].offsetTop - headerHeight !== currentScroll) {
        currentSectionIndex -= 1;
      }
    
      let targetSection: HTMLElement | null = null;
      if (event.deltaY > 0 && currentSectionIndex < sections.length - 1) {
        targetSection = sections[currentSectionIndex + 1] as HTMLElement;
      } else if (event.deltaY < 0 && currentSectionIndex > 0) {
        targetSection = sections[currentSectionIndex - 1] as HTMLElement;
      }
    
      if (targetSection) {
        window.scrollTo({ top: targetSection.offsetTop - headerHeight, behavior: "smooth" });
      }
    };    

    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => window.removeEventListener("wheel", handleScroll);
  }, []);
  
  return (
    <div className="min-h-screen bg-green_pastel2 flex flex-col items-center mx-auto py-4 relative">
      {/* Header */}
      <Header isLoggedIn={false} level={""} setLevel={function (): void {
        throw new Error("Function not implemented.");
      } }/>

      {/* Title Section */}
      <main className="w-full max-w-[65vw] text-secondary mt-56 mb-32 scroll-smooth">
        {/* Section Học cụm từ */}
        <section className="mt-12 flex gap-6">
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center">
              <FeatureButton
                icon={Book}
                isDone={true}
              />              
              <h3 className="text-secondary font-bold text-2xl">Học cụm từ</h3>
            </div>
            <div className="text-cyan_text ml-36 space-y-3">
              <p className="font-semibold">Flashcard</p>
              <p>Học từ vựng và cụm từ đi kèm theo từng bài nhỏ.</p>
              <p className="font-semibold mt-2">Luyện tập</p>
              <p>Thử thách trí nhớ và khả năng ghép cụm của bạn!</p>
            </div>
          </div>
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px]">
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              navigation
              className="rounded-xl shadow-lg h-full [&_.swiper-button-next]:text-green_pastel [&_.swiper-button-prev]:text-green_pastel"
            >
              {images1.map((image, index) => (
                <SwiperSlide key={index} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-xl shadow-lg w-full h-full object-cover cursor-pointer"
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
          </div>
        </section>

        {/* Section Luyện dịch câu */}
        <section className="mt-12 flex gap-6">
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px] relative">
            <div className="absolute w-20 h-20 bg-green_pastel rounded-full top-36 -left-12"></div>
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              navigation
              className="rounded-xl shadow-lg h-full [&_.swiper-button-next]:text-green_pastel [&_.swiper-button-prev]:text-green_pastel"
            >
              {images2.map((image, index) => (
                <SwiperSlide key={index} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-xl shadow-lg w-full h-full object-cover cursor-pointer"
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
          </div>
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center justify-end">           
              <h3 className="text-secondary font-bold text-2xl">Luyện dịch câu</h3>
              <FeatureButton
                icon={Pencil}
                isDone={true}
              />  
            </div>
            <div className="text-cyan_text ml-20 mr-36 space-y-3">
              <p>Cải thiện khả năng luyện dịch ngược từ tiếng Việt → tiếng Nhật.</p>
              <p>Giúp bạn hiểu cấu trúc thành phần câu và cách sử dụng cụm từ đã học.</p>
            </div>
          </div>
        </section>

        {/* Section Luyện nghe */}
        <section className="mt-12 flex gap-6">
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center">
              <FeatureButton
                icon={Headphones}
                isDone={true}
              />              
              <h3 className="text-secondary font-bold text-2xl">Luyện nghe</h3>
            </div>
            <div className="text-cyan_text ml-36 space-y-3">
              <p className="font-semibold">Flashcard</p>
              <p>Học từ vựng và cụm từ đi kèm theo từng bài nhỏ.</p>
              <p className="font-semibold mt-2">Luyện tập</p>
              <p>Thử thách trí nhớ và khả năng ghép cụm của bạn!</p>
            </div>
          </div>
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px]">
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              navigation
              className="rounded-xl shadow-lg h-full [&_.swiper-button-next]:text-green_pastel [&_.swiper-button-prev]:text-green_pastel"
            >
              {images3.map((image, index) => (
                <SwiperSlide key={index} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-xl shadow-lg w-full h-full object-cover cursor-pointer"
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
          </div>
        </section>

        {/* Section Làm bài test */}
        <section className="mt-12 flex gap-6">
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px] relative">
            <div className="absolute w-10 h-10 bg-green_pastel rounded-full bottom-0 -right-20"></div>
            <div className="absolute w-6 h-6 bg-green_pastel rounded-full -bottom-8 -right-28"></div>
            <Swiper
              modules={[Autoplay, Navigation]}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              loop={true}
              navigation
              className="rounded-xl shadow-lg h-full [&_.swiper-button-next]:text-green_pastel [&_.swiper-button-prev]:text-green_pastel"
            >
              {images4.map((image, index) => (
                <SwiperSlide key={index} onClick={(e) => e.stopPropagation()}>
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="rounded-xl shadow-lg w-full h-full object-cover cursor-pointer"
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
          </div>
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center justify-end">           
              <h3 className="text-secondary font-bold text-2xl">Làm bài test</h3>
              <FeatureButton
                icon={FileText}
                isDone={true}
              />  
            </div>
            <div className="text-cyan_text ml-20 mr-36 space-y-3">
              <p>Cải thiện khả năng luyện dịch ngược từ tiếng Việt → tiếng Nhật.</p>
              <p>Giúp bạn hiểu cấu trúc thành phần câu và cách sử dụng cụm từ đã học.</p>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <div className="absolute w-20 h-20 bg-green_pastel rounded-full bottom-10 left-[30vw]"></div>
          <button 
            onClick={() => navigate("/login")}
            className="text-3xl font-bold mt-20 border-none focus:outline-none hover:text-primary"
          >
            Bắt đầu cùng Midori!
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
