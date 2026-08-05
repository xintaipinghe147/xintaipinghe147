"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  Menu,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { SessionUser } from "@/lib/types";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.06-6.93z" />
    </svg>
  );
}

function LinkedinIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.86-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.28 2.37 4.28 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.55V9h3.57v11.45z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Landing({ user }: { user: SessionUser | null }) {
  const [videoFailed, setVideoFailed] = useState(false);
  const accountHref = user ? "/me" : "/login";
  const accountLabel = user ? user.username : "登录";
  const joinHref = user ? "/new" : "/signup";

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-display text-white">
      {/* 兜底背景图：视频加载失败时仍显示完整画面 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-poster.jpg"
        alt=""
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      {/* 背景视频：铺满整个视口，加载失败时自动移除，露出兜底图 */}
      {videoFailed ? null : (
        <video
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          src={VIDEO_URL}
          poster="/hero-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onError={() => setVideoFailed(true)}
        />
      )}
      {/* 轻微压暗，保证文字清晰（不引入任何彩色） */}
      <div className="absolute inset-0 z-[5] bg-black/15" />

      {/* 内容层 */}
      <div className="relative z-10 flex min-h-screen flex-row">
        {/* ===== 左栏 ===== */}
        <div className="relative flex w-full flex-col lg:w-[52%]">
          <div className="liquid-glass-strong absolute inset-4 rounded-3xl lg:inset-6" />

          {/* 顶部导航 */}
          <div className="relative flex items-center justify-between px-10 pt-8 lg:px-12">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="旅行手账"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-2xl font-semibold tracking-tighter text-white">
                旅行手账
              </span>
            </div>
            <Link
              href="/timeline"
              className="liquid-glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80 transition-transform hover:scale-105"
            >
              <Menu className="h-4 w-4" />
              浏览手账
            </Link>
          </div>

          {/* 主视觉 */}
          <div className="flex flex-1 flex-col items-center justify-center px-10 py-14 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              width={80}
              height={80}
              className="rounded-full"
            />
            <h1 className="mt-9 text-6xl font-medium leading-[1.05] tracking-[-0.05em] text-white lg:text-7xl">
              把走过的路
              <br />
              <em className="font-serif text-white/80">写成一册手账</em>
            </h1>
            <Link
              href="/new"
              className="liquid-glass-strong mt-10 inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg text-white transition-transform hover:scale-105 active:scale-95"
            >
              开始记录
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Download className="h-4 w-4" />
              </span>
            </Link>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/timeline"
                className="liquid-glass rounded-full px-4 py-2 text-xs text-white/80 transition-transform hover:scale-105"
              >
                最新动态
              </Link>
              <Link
                href="/timeline#map"
                className="liquid-glass rounded-full px-4 py-2 text-xs text-white/80 transition-transform hover:scale-105"
              >
                世界足迹
              </Link>
              <Link
                href="/new"
                className="liquid-glass rounded-full px-4 py-2 text-xs text-white/80 transition-transform hover:scale-105"
              >
                写日记
              </Link>
            </div>
          </div>

          {/* 底部引言 */}
          <div className="relative px-10 pb-10 lg:px-12">
            <p className="text-xs uppercase tracking-widest text-white/50">
              Our Journey
            </p>
            <p className="mt-3 text-lg leading-relaxed text-white/80">
              我们想象一个
              <span className="font-serif italic text-white">
                没有终点的世界
              </span>
              。
            </p>
            <div className="mt-4 flex items-center gap-3 text-white/50">
              <span className="h-px flex-1 bg-white/20" aria-hidden />
              <span className="text-xs tracking-widest">旅行手账 · 2026</span>
              <span className="h-px flex-1 bg-white/20" aria-hidden />
            </div>
          </div>
        </div>

        {/* ===== 右栏（仅桌面端） ===== */}
        <div className="relative hidden w-[48%] flex-col p-6 lg:flex">
          {/* 顶部：社交 + 账号 */}
          <div className="flex items-center justify-end gap-4">
            <div className="liquid-glass flex items-center gap-1 rounded-full p-2 pr-3">
              <a
                href="#"
                aria-label="X"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:text-white/80"
              >
                <XIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:text-white/80"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:text-white/80"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <ArrowRight className="ml-2 h-4 w-4 text-white/80" />
            </div>
            <Link
              href={accountHref}
              className="liquid-glass flex items-center gap-3 rounded-full py-2 pl-2 pr-5 text-sm text-white/80 transition-transform hover:scale-105"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="h-4 w-4" />
              </span>
              {accountLabel}
            </Link>
          </div>

          {/* 社区卡片 */}
          <Link
            href={joinHref}
            className="liquid-glass mt-9 w-56 rounded-3xl p-6 transition-transform hover:scale-105"
          >
            <h3 className="text-lg font-medium text-white">进入我们的旅程</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              注册并写下第一篇旅行日记，点亮属于你的足迹。
            </p>
          </Link>

          {/* 底部功能区 */}
          <div className="liquid-glass mt-auto rounded-[2.5rem] p-5">
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/new"
                className="liquid-glass rounded-3xl p-5 transition-transform hover:scale-105"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <Wand2 className="h-4 w-4" />
                </span>
                <h4 className="mt-4 font-medium text-white">写日记</h4>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  记录路上的故事与照片
                </p>
              </Link>
              <Link
                href="/timeline"
                className="liquid-glass rounded-3xl p-5 transition-transform hover:scale-105"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <BookOpen className="h-4 w-4" />
                </span>
                <h4 className="mt-4 font-medium text-white">时光存档</h4>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  按时间重走每一段旅程
                </p>
              </Link>
            </div>

            <Link
              href="/timeline#map"
              className="liquid-glass mt-4 flex items-center gap-4 rounded-3xl p-4 transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-thumb.png"
                alt="世界足迹地图"
                width={96}
                height={64}
                className="h-16 w-24 shrink-0 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-white">世界足迹地图</h4>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  每一篇日记，都是地图上的一点
                </p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Plus className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
