import { Bell } from "lucide-react";

interface HeaderProps {
  level: string;
  setLevel: (level: string) => void; // Nhận function từ Layout
}
const Header = ({ level, setLevel }: HeaderProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(e.target.value);
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-end items-center gap-10 p-6 bg-white z-100 text-lg">
      <div className="relative">
        <select
          value={level}
          onChange={handleChange}
          className="border border-green_border text-green_border font-bold px-6 bg-white py-2 rounded-lg focus:outline-none hover:bg-green_pastel cursor-pointer"
        >
          <option value="N3" className="rounded-xl hover:bg-secondary px-4 py-2">N3</option>
          <option value="N2">N2</option>
          <option value="N1">N1</option>
        </select>
      </div>

      {/* Icon chuông & số lượng thông báo */}
      <div className="flex items-center text-secondary">
        <Bell size={20} />
      </div>

      <div className="flex items-center gap-2 text-secondary font-bold">
        2408
      </div>

      {/* Vòng tròn phía bên phải */}
      <div className="w-10 h-10 bg-green_pastel rounded-full"></div>
    </header>
  );
};

export default Header;
