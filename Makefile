.PHONY: help install dev run build preview lint deploy clean

# Mặc định: hiển thị trợ giúp
help:
	@echo "Các lệnh có sẵn:"
	@echo "  make install   - Cài đặt dependencies (npm install)"
	@echo "  make dev       - Chạy dev server (npm run dev)"
	@echo "  make run       - Alias của 'make dev' (dùng được 'make run dev')"
	@echo "  make build     - Build production (npm run build)"
	@echo "  make preview   - Xem thử bản build (npm run preview)"
	@echo "  make lint      - Kiểm tra lint (npm run lint)"
	@echo "  make deploy    - Build & deploy lên GitHub Pages (npm run deploy)"
	@echo "  make clean     - Xoá thư mục dist và node_modules"

install:
	npm install

dev:
	npm run dev

# Cho phép cả 'make run' lẫn 'make run dev' (vite chạy foreground nên chỉ khởi động 1 lần)
run: dev

build:
	npm run build

preview:
	npm run preview

lint:
	npm run lint

deploy:
	npm run deploy

clean:
	rm -rf dist node_modules

push:
	git add .
	git commit -m "update"
	git push origin HEAD