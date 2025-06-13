import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FeatureButton from "../components/home/FeatureButton";
import { Book, Pencil, Headphones, FileText } from "lucide-react";
import flashcard from "../assets/flashcard.png";
import ex_choice from "../assets/ex_choice.png";
import ex_match from "../assets/ex_match.png";
import ex_translate from "../assets/ex_translate.png";
import ex_blank from "../assets/ex_blank.png";
import ex_listen from "../assets/ex_listen.png";
import ex_listen_fill from "../assets/ex_listen_fill.png";
import land_test from "../assets/land_test.png";
import dotest from "../assets/dotest.png";
import Header from "../components/Header";
import { Slide } from "../components/Slide";

const images1 = [flashcard, ex_choice, ex_match];
const images2 = [ex_translate, ex_blank];
const images3 = [ex_listen, ex_listen_fill];
const images4 = [land_test, dotest];

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
                isDone={true} onClick={function (): void {
                  throw new Error("Function not implemented.");
                } }              />              
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
            <Slide images={images1} />
          </div>
        </section>

        {/* Section Luyện dịch câu */}
        <section className="mt-12 flex gap-6">
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px]">
            <Slide images={images2} />
          </div>
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center justify-end">           
              <h3 className="text-secondary font-bold text-2xl">Luyện dịch câu</h3>
              <FeatureButton
                icon={Pencil}
                isDone={true} onClick={function (): void {
                  throw new Error("Function not implemented.");
                } }              />  
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
                isDone={true} onClick={function (): void {
                  throw new Error("Function not implemented.");
                } }              />              
              <h3 className="text-secondary font-bold text-2xl">Luyện nghe</h3>
            </div>
            <div className="text-cyan_text ml-36 space-y-3">
              <p>Kết hợp đa giác quan để ghi nhớ sâu từ vựng và cách dùng từ trong câu.</p>
              <p>Cải thiện khả năng nghe hiểu và phản xạ nhanh khi giao tiếp thực tế.</p>
            </div>
          </div>
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px]">
            <Slide images={images3} />
          </div>
        </section>

        {/* Section Làm bài test */}
        <section className="mt-12 flex gap-6">
          {/* Image Placeholder */}
          <div className="w-full md:w-1/2 h-[400px]">
            <Slide images={images4} />
          </div>
          {/* Feature Button + Text */}
          <div className="w-full md:w-1/2">
            <div className="flex gap-5 items-center justify-end">           
              <h3 className="text-secondary font-bold text-2xl">Làm bài test</h3>
              <FeatureButton
                icon={FileText}
                isDone={true} onClick={function (): void {
                  throw new Error("Function not implemented.");
                } }              />  
            </div>
            <div className="text-cyan_text ml-20 mr-36 space-y-3">
              <p>Kiểm tra kiến thức bạn ghi nhớ với cơ hội tích điểm x2.</p>
              <p>Làm test để hoàn thành trọn vẹn bài học nhé!</p>
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
