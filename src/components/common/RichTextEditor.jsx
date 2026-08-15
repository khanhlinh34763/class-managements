import React, { useRef, useEffect } from 'react';
import {
  Heading1, Heading2, Heading3, Bold, Italic, List, ListOrdered,
} from 'lucide-react';

const TOOLS = [
  { key: 'h1', title: 'Tiêu đề lớn (H1)', icon: Heading1, cmd: 'formatBlock', value: 'H1' },
  { key: 'h2', title: 'Tiêu đề vừa (H2)', icon: Heading2, cmd: 'formatBlock', value: 'H2' },
  { key: 'h3', title: 'Tiêu đề nhỏ (H3)', icon: Heading3, cmd: 'formatBlock', value: 'H3' },
  { key: 'bold', title: 'In đậm', icon: Bold, cmd: 'bold' },
  { key: 'italic', title: 'In nghiêng', icon: Italic, cmd: 'italic' },
  { key: 'ul', title: 'Gạch đầu dòng', icon: List, cmd: 'insertUnorderedList' },
  { key: 'ol', title: 'Danh sách 1. 2. 3.', icon: ListOrdered, cmd: 'insertOrderedList' },
];

export default function RichTextEditor({ value = '', onChange, placeholder = 'Nhập câu trả lời của em...' }) {
  const editorRef = useRef(null);

  // Chỉ nạp HTML từ ngoài vào khi khác nội dung hiện tại và không đang gõ (tránh nhảy con trỏ)
  useEffect(() => {
    const el = editorRef.current;
    if (el && el.innerHTML !== value && document.activeElement !== el) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const runCommand = (tool) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    // eslint-disable-next-line no-restricted-syntax
    document.execCommand(tool.cmd, false, tool.value);
    handleInput();
  };

  return (
    <div className="border-2 border-gray-100 rounded-xl overflow-hidden focus-within:border-happy-pink transition-colors">
      <div className="flex flex-wrap gap-1 bg-gray-50 border-b border-gray-100 p-1.5">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              type="button"
              title={tool.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => runCommand(tool)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-happy-pink hover:text-white transition-colors"
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={handleInput}
        className="rich-content min-h-[8rem] max-h-72 overflow-y-auto px-4 py-3 outline-none text-gray-700 leading-relaxed"
        suppressContentEditableWarning
      />
    </div>
  );
}
