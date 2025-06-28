import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Select, MenuItem, FormControl } from "@mui/material";
import { getOverallRanking, getLevelRanking, RankingUser } from "../services/api";
import { FaTrophy } from "react-icons/fa";
import avatar from "../assets/avatar.svg";
import point from "../assets/point.png";

const periodOptions = [
  { value: "day", label: "Hôm nay" },
  { value: "week", label: "Tuần này" },
  { value: "month", label: "Tháng này" },
] as const;

const TopThreeRanking = ({ users, currentUserId }: { users: RankingUser[], currentUserId: number }) => {
  const topThree = users.slice(0, 3);

  const getPositionClass = (position: number) => {
    const isCurrentUser = topThree[position]?.id === currentUserId;
    const baseClasses = {
      0: "w-44 h-56 bg-[#fcffe6] border border-[#ffe58f]",
      1: "w-36 h-44 bg-[#f0f5ff] border border-[#c7d1f4]",
      2: "w-32 h-36 bg-[#fff0f6] border border-[#ffadd2]"
    };

    if (!isCurrentUser) return baseClasses[position as keyof typeof baseClasses];
    
    // Add glow effect for current user
    return `${baseClasses[position as keyof typeof baseClasses]} border-4 shadow-xl`;
  };

  return (
    <div className="flex justify-center items-end gap-4 mb-8 min-h-[20vh]">
      {/* Second Place */}
      <div className="flex flex-col items-center">
        <div className={`${getPositionClass(1)} rounded-xl flex flex-col items-center justify-center mb-2`}>
          <p className="text-2xl font-bold text-cyan_text mb-2">2</p>
          <img
            src={topThree[1]?.avatar_url || avatar} 
            className="w-16 h-16 rounded-full mb-2" 
            alt="Second place" />
          <FaTrophy className="text-silver text-3xl" />
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-500">{topThree[1]?.username}</div>
          <div className="flex gap-1 items-center justify-center">
            <div className="text-cyan_text text-lg font-bold">{topThree[1]?.point}</div>
            <img src={point} alt=" " className="w-8 h-8"/>
          </div>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center">
        <div className={`${getPositionClass(0)} rounded-xl flex flex-col items-center justify-center mb-2`}>
          <p className="text-3xl font-bold text-cyan_text mb-2">1</p>
          <img
            src={topThree[0]?.avatar_url || avatar} 
            className="w-20 h-20 rounded-full mb-2" 
            alt="First place" />
          <FaTrophy className="text-gold text-4xl" />
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-gray-500">{topThree[0]?.username}</div>
          <div className="flex gap-1 items-center justify-center">
            <div className="text-cyan_text text-lg font-bold">{topThree[0]?.point}</div>
            <img src={point} alt=" " className="w-8 h-8"/>
          </div>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        <div className={`${getPositionClass(2)} rounded-xl flex flex-col items-center justify-center mb-2`}>
          <p className="text-xl font-bold text-cyan_text mb-2">3</p>
          <img
            src={topThree[2]?.avatar_url || avatar} 
            className="w-16 h-16 rounded-full mb-2" 
            alt="Third place" />
          <FaTrophy className="text-bronze text-2xl" />
        </div>
        <div className="text-center">
          <div className="font-bold text-gray-500">{topThree[2]?.username}</div>
          <div className="flex gap-1 items-center justify-center">
            <div className="text-cyan_text text-lg font-bold">{topThree[2]?.point}</div>
            <img src={point} alt=" " className="w-8 h-8"/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Ranking() {
  const { level, profileUpdated } = useOutletContext<{ level: string, profileUpdated: number; }>();
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const [overallRanking, setOverallRanking] = useState<RankingUser[]>([]);
  const [levelRanking, setLevelRanking] = useState<RankingUser[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  // Fetch overall ranking
  useEffect(() => {
    const fetchOverallRanking = async () => {
      const data = await getOverallRanking();
      setOverallRanking(data.rankings);
      setCurrentUserId(data.current_user_id);
    };
    fetchOverallRanking();
  }, [profileUpdated]);

  // Fetch level ranking
  useEffect(() => {
    const fetchLevelRanking = async () => {
      const data = await getLevelRanking(level, period);
      setLevelRanking(data.rankings);
    };
    fetchLevelRanking();
  }, [level, period, profileUpdated]);

  const RankingTable = ({ data, currentUserId }: { data: RankingUser[], currentUserId: number }) => {
    const currentUserIndex = data.findIndex(user => user.id === currentUserId);
    
    return (
      <div className="bg-white rounded-xl p-4 max-w-3xl mx-auto">
        <div className="space-y-2">
          {/* Vị trí 4, 5 */}
          {data.slice(3, 10).map((user, index) => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <div 
                key={user.id} 
                className={`grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-xl hover:bg-gray-100
                  ${isCurrentUser ? "bg-[#B7EB8F]" : ""}`}
              >
                <div className="col-span-2 text-gray-600 font-medium">
                  {index + 4}
                </div>
                <div className="col-span-7 flex items-center gap-3">
                  <img 
                    src={user.avatar_url || avatar} 
                    alt={user.username} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-cyan_pastel"
                  />
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <span className="font-bold text-cyan_text">{user.point}</span>
                  <img src={point} alt="point" className="w-6 h-6" />
                </div>
              </div>
            );
          })}

          {currentUserIndex != 10 && (
            <div className="text-center py-2 text-gray-400">••••</div>
          )}

          {/* Vị trí người dùng hiện tại */}
          {currentUserIndex >= 10 && (
            <div>
              <div 
                className="grid grid-cols-12 gap-4 items-center px-4 py-3 bg-[#B7EB8F] hover:bg-gray-100 rounded-xl"
              >
                <div className="col-span-2 text-gray-600 font-medium">
                  {currentUserIndex + 1}
                </div>
                <div className="col-span-7 flex items-center gap-3">
                  <img 
                    src={data[currentUserIndex].avatar_url || avatar} 
                    alt={data[currentUserIndex].username} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-cyan_pastel"
                  />
                  <span className="font-medium">{data[currentUserIndex].username}</span>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <span className="font-bold text-cyan_text">
                    {data[currentUserIndex].point}
                  </span>
                  <img src={point} alt="point" className="w-6 h-6" />
                </div>
              </div>
              <div className="text-center py-2 text-gray-400">••••</div>
            </div>
          )} 
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-secondary mb-4 uppercase">Bảng xếp hạng tổng thể</h2>
        <TopThreeRanking users={overallRanking} currentUserId={currentUserId}/>
        <RankingTable data={overallRanking} currentUserId={currentUserId} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-secondary uppercase">
          Cấp độ {level}
        </h2>
        <div className="flex justify-end mb-4">
          <FormControl
            sx={{
              minWidth: 120,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#139139",
                  borderRadius: "8px",
                  borderWidth: "1px",
                },
                "&:hover fieldset": {
                  borderColor: "#139139",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#139139",
                  borderWidth: "1px",
                },
                "& .MuiSelect-select": {
                  padding: "8px 18px",
                  height: "2em",
                  minHeight: "1.2em",
                  display: "flex",
                  alignItems: "center"
                },
              },
              "& .MuiInputLabel-outlined": {
                color: "#008000",
                fontWeight: "bold",
                "&.Mui-focused": {
                  color: "#008000",
                },
              },
            }}
          >
            <Select
              className="focus:outline-none"
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    "& .MuiMenuItem-root": {
                      "&:hover, &:focus": {
                        backgroundColor: "#E8F5E9",
                      },
                    },
                  },
                },
              }}
              sx={{
                color: "#008000",
                fontWeight: "bold",
                "& .MuiSelect-icon": {
                  color: "#008000"
                },
                "& .hover":{
                  backgroundColor: "#E8F5E9"
                }
              }}
            >
              {periodOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <TopThreeRanking users={levelRanking} currentUserId={currentUserId}/>
        <RankingTable data={levelRanking} currentUserId={currentUserId} />
      </div>
    </div>
  );
}
