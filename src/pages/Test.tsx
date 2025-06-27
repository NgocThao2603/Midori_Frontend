import { useParams, useNavigate } from "react-router-dom";
import { Button, Tabs, Tab } from "@mui/material";
import quoteIcon from "../assets/quote-icon.png";
import { useLessonStatuses } from "../contexts/LessonStatusContext";
import doneTicker from "../assets/doneTicker.png"; 
import point from "../assets/point.png";
import { getTests, TestInfo, fetchTestAttemptsByTestId, TestAttempt, createTestAttempt } from "../services/api";
import { useEffect, useMemo, useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { Select, MenuItem, FormControl, TablePagination } from "@mui/material";
import { StatusBadge } from "../components/test_attempts/StatusBadge";
import { formatDuration } from "../services/timeService";

const Test: React.FC = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { isDoneStatus } = useLessonStatuses();
  const done = lessonId ? isDoneStatus(Number(lessonId), "test") : false;

  const [testList, setTestList] = useState<TestInfo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedTest = testList[selectedIndex];

  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: "all", label: "Tất cả", color: "secondary" },
    { value: "pass", label: "Đạt", color: "success" },
    { value: "fail", label: "Chưa đạt", color: "error" },
    { value: "in_progress", label: "Đang làm", color: "info" },
    { value: "abandoned", label: "Chưa hoàn thành", color: "default" },
  ] as const;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const inProgressAttempt = testAttempts.find(
    attempt => attempt.status === "in_progress"
  );

  const filteredAttempts = useMemo(() => 
    testAttempts.filter((attempt) => {
      const isPass = attempt.score !== null && 
        attempt.score >= (selectedTest?.pass_score || 0);
        
      switch (statusFilter) {
        case "pass":
          return attempt.status === "completed" && isPass;
        case "fail":
          return attempt.status === "completed" && !isPass;
        case "in_progress":
          return attempt.status === "in_progress";
        case "abandoned":
          return attempt.status === "abandoned";
        default:
          return true;
      }
    }), [testAttempts, statusFilter, selectedTest?.pass_score]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = async () => {
    try {
      if (!selectedTest?.id) {
        console.error("No test selected");
        return;
      }

      if (inProgressAttempt) {
        navigate(`/practice-test/${inProgressAttempt.id}`);
        return;
      }

      const testAttempt = await createTestAttempt(selectedTest.id);
      if (!testAttempt?.id) {
        console.error("Invalid test attempt response");
        return;
      }
      navigate(`/practice-test/${testAttempt.id}`);
    } catch (error) {
      console.error("Lỗi khi tạo test_attempt:", error);
    }
  };

  useEffect(() => {
    if (lessonId) {
      getTests(Number(lessonId)).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestList(data);
          setSelectedIndex(0);
          // Set rowsPerPage to 4 if there are multiple tests
          if (data.length > 1) {
            setRowsPerPage(4);
          } else {
            setRowsPerPage(5);
          }
        } else {
          setTestList([]);
          setSelectedIndex(0);
        }
      });
    }
  }, [lessonId]);

  useEffect(() => {
    const fetchTestAttempts = async () => {
      if (!selectedTest?.id) {
        setTestAttempts([]);
        return;
      }

      setLoading(true);
      try {
        const attempts = await fetchTestAttemptsByTestId(selectedTest.id);
        const attemptsArray = Array.isArray(attempts) ? attempts : [];
        const sortedAttempts = attemptsArray.sort((a, b) =>
          new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        setTestAttempts(sortedAttempts);
      } catch (error) {
        setTestAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestAttempts();
  }, [selectedTest?.id]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col items-center">
      <div className="relative w-full max-w-4xl">
        {lessonId && done && (
          <img src={doneTicker} alt=" " className="w-24 h-24 absolute top-8 right-2 z-10" />
        )}
      </div>

      {/* Tabs */}
      {testList.length > 1 && (
        <div className="w-full">
          <Tabs
            value={selectedIndex}
            onChange={(_, newIndex) => setSelectedIndex(newIndex)}
            variant="scrollable"
            scrollButtons="auto"
            className="border-b"
            slotProps={{ indicator: { style: { display: "none" } } }}
          >
            {testList.map((test, index) => (
              <Tab
                key={test.id}
                label={`Bài test ${index + 1}`}
                sx={{
                  fontWeight: "bold",
                  fontSize: 16,
                  color: "gray",
                  backgroundColor: "transparent",
                  borderRadius: "15px 15px 0 0",
                  transition: "background 0.3s, color 0.3s",
                  border: "none",
                  outline: "none",
                  "&.Mui-selected": {
                    backgroundColor: "#1B5E20",
                    color: "white",
                    border: "none",
                  },
                  "&:focus": {
                    outline: "none",
                    border: "none",
                  },
                  "&:active": {
                    outline: "none",
                    border: "none",
                  },
                }}
              />
            ))}
          </Tabs>
        </div>
      )}

      {/* Card nội dung bài test */}
      <div className="relative border border-cyan_border rounded-xl p-4 bg-cyan_pastel text-cyan_text w-full mt-6">
        <img src={quoteIcon} alt="" className="absolute top-4 left-4 w-4 h-4"/>
        <img src={quoteIcon} alt="" className="absolute bottom-4 right-2 w-4 h-4 rotate-180" />
        <div className="py-6 px-8">
          <p className="font-semibold text-2xl text-center">
            {selectedTest ? selectedTest.title : "Đang tải..."}
          </p>
          <div className="flex justify-between mt-6 mx-4">
            <p className="text-lg">Điểm tối đa: <span className="text-xl text-secondary font-bold">{selectedTest?.total_score ?? "100"}</span></p>
            <p className="text-lg">Điểm qua bài: <span className="text-xl text-red_text font-bold">{selectedTest?.pass_score ?? "75"}</span></p>
            <p className="text-lg">Thời gian: <span className="text-xl text-cyan_text font-bold">{selectedTest?.duration_minutes ?? "30"} phút</span></p>
          </div>
          <p className="mt-6 font-semibold text-xl flex items-center justify-center">
            Hoàn thành bài test để có {selectedTest?.total_score} <img src={point} alt=" " className="w-8 h-8"/>!
          </p>
        </div> 
      </div>
      <div className="-mb-2">
        <Button
          variant="contained"
          onClick={handleClick}
          className="!bg-cyan_border hover:!bg-secondary !text-white !font-bold !text-xl !px-6 !py-4 !mt-6 !rounded-lg !focus:outline-none"
          sx={{
            "&:focus": { outline: "none", boxShadow: "none" },
          }}
        >
          {inProgressAttempt 
            ? "TIẾP TỤC" 
            : done 
              ? "LÀM LẠI" 
              : "BẮT ĐẦU BÀI TEST"
          }
        </Button>
      </div>

      {/* History Section */}
      <div className="w-full mt-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-cyan_text">Lịch sử làm bài</h3>
          <FormControl 
            size="small" 
            sx={{
              minWidth: 120,
              "& .MuiOutlinedInput-root": {
                borderRadius: "16px",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
                "&:focus": {
                  outline: "none",
                },
              },
              "& .MuiInputBase-input": {
                borderRadius: "16px",
              },
              "& .MuiInputLabel-root": {
                color: "#0F8480",
                "&.Mui-focused": {
                  color: "#F2FDFD",
                },
              },
            }}
          >
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              displayEmpty
              className="bg-white"
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <StatusBadge status={option.value as any} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 border-4 border-cyan_border border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : testAttempts.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Chưa có lịch sử làm bài
          </p>
        ) : filteredAttempts.length > 0 ? (
          <div className="bg-white rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-cyan_pastel text-cyan_text">
                <tr>
                  <th className="py-3 px-4 text-left">Lần</th>
                  <th className="py-3 px-4 text-left">Ngày làm</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Điểm</th>
                  <th className="py-3 px-4 text-center">Số câu đã làm</th>
                  <th className="py-3 px-4 text-center">Thời gian</th>
                  <th className="py-3 px-4 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((attempt, index) => {
                    const isPass = attempt.score !== null && 
                      attempt.score >= (selectedTest?.pass_score || 0);

                    let statusValue: "pass" | "fail" | "in_progress" | "abandoned" = "abandoned";
                    if (attempt.status === "completed") {
                      statusValue = isPass ? "pass" : "fail";
                    } else if (attempt.status === "in_progress") {
                      statusValue = "in_progress";
                    }
                  
                  return (
                    <tr key={attempt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{testAttempts.length - (index + page * rowsPerPage)}</td>
                      <td className="py-3 px-4">
                        {new Date(attempt.start_time).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={statusValue} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        {attempt.score === null ? "-" : attempt.score}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {attempt.answered_count}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {formatDuration(attempt.start_time, attempt.end_time, selectedTest?.duration_minutes)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          onClick={() => {
                            if (attempt.status !== "in_progress") {
                              navigate(`/test-result/${attempt.id}`);
                            }
                          }}
                          className="min-w-0 !p-1 focus:outline-none"
                        >
                          {attempt.status === "in_progress" ? (
                            <VisibilityOffOutlinedIcon className="text-gray-400" />
                          ) : (
                            <RemoveRedEyeIcon className="text-cyan_text" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <TablePagination
              component="div"
              count={filteredAttempts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={testList.length > 1 ? [4, 8, 20] : [5, 10, 25]}
              labelRowsPerPage="Số dòng mỗi trang"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} của ${count}`
              }
              sx={{
                "& .MuiSelect-select:focus": {
                  outline: "none",
                },
                "& .MuiInputBase-root:focus-within": {
                  outline: "none",
                  boxShadow: "none",
                },
                "& .MuiTablePagination-actions button:focus": {
                  outline: "none",
                  boxShadow: "none",
                },
                ".MuiTablePagination-select": {
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                },
                ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
                  color: "#0F8480",
                }
              }}
              className="focus:outline-none"
            />
          </div>
        ) :  (
          <p className="text-center text-gray-500 py-4">
            Không có kết quả phù hợp
          </p>
        )}
      </div>
    </div>
  );
};

export default Test;
