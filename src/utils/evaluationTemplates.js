// Các kì đánh giá định kì trong năm học
export const EVAL_PERIODS = [
  { key: 'gk1', label: 'Giữa kì I' },
  { key: 'ck1', label: 'Cuối kì I' },
  { key: 'gk2', label: 'Giữa kì II' },
  { key: 'ck2', label: 'Cuối kì II' },
];

// 3 mức đánh giá theo Thông tư 27
export const EVAL_LEVELS = [
  { key: 'HTT', label: 'Hoàn thành tốt', color: 'text-happy-green', badge: 'bg-green-100 text-green-700' },
  { key: 'HT', label: 'Hoàn thành', color: 'text-happy-blue', badge: 'bg-blue-100 text-blue-700' },
  { key: 'CHT', label: 'Chưa hoàn thành', color: 'text-red-500', badge: 'bg-red-100 text-red-600' },
];

// Nhận xét mẫu sẵn cho từng mức đánh giá
export const SAMPLE_COMMENTS = {
  HTT: [
    'Nắm vững kiến thức, kĩ năng; vận dụng linh hoạt vào thực tế. Tích cực phát biểu xây dựng bài.',
    'Tiếp thu bài nhanh, hoàn thành tốt các nhiệm vụ học tập. Có khả năng tự học tốt.',
    'Học tập chăm chỉ, kết quả nổi bật. Biết giúp đỡ bạn bè trong học tập.',
    'Có ý thức học tập cao, trình bày bài sạch đẹp, khoa học.',
    'Vận dụng kiến thức tốt, tư duy nhanh nhạy, tự tin khi trình bày ý kiến.',
    'Hoàn thành xuất sắc các bài tập, có nhiều tiến bộ vượt bậc.',
  ],
  HT: [
    'Nắm được kiến thức, kĩ năng cơ bản của môn học. Hoàn thành các nhiệm vụ học tập.',
    'Có cố gắng trong học tập, hoàn thành nội dung các bài học.',
    'Tiếp thu được bài, cần phát huy hơn nữa tính tích cực trong giờ học.',
    'Hoàn thành các bài tập, cần rèn thêm kĩ năng trình bày.',
    'Đã đạt yêu cầu của môn học, cần chăm chỉ hơn để tiến bộ.',
    'Nắm bài ở mức cơ bản, cần mạnh dạn phát biểu ý kiến hơn.',
  ],
  CHT: [
    'Chưa nắm vững kiến thức, kĩ năng cơ bản. Cần sự hỗ trợ thêm từ thầy cô và gia đình.',
    'Tiếp thu bài còn chậm, cần cố gắng nhiều hơn trong học tập.',
    'Chưa hoàn thành một số nhiệm vụ học tập, cần rèn luyện thêm ở nhà.',
    'Cần chăm chỉ, tập trung hơn trong giờ học để tiến bộ.',
    'Kĩ năng còn hạn chế, đề nghị gia đình phối hợp kèm cặp thêm cho em.',
    'Chưa đạt yêu cầu môn học, cần bổ sung những kiến thức còn thiếu.',
  ],
};

export function periodLabel(key) {
  return EVAL_PERIODS.find((p) => p.key === key)?.label || key;
}

export function levelInfo(key) {
  return EVAL_LEVELS.find((l) => l.key === key) || { key, label: key, color: 'text-gray-500', badge: 'bg-gray-100 text-gray-600' };
}
