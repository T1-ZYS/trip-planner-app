"use client";

import { useMemo, useState } from "react";
import type { Todo } from "@/types/trip";
import { SectionTitle } from "@/components/SectionTitle";

type TodoSectionProps = {
  todos: Todo[];
  onChange: (todos: Todo[]) => void;
};

export function TodoSection({ todos, onChange }: TodoSectionProps) {
  const [draft, setDraft] = useState("");

  const completed = useMemo(() => todos.filter((todo) => todo.completed).length, [todos]);
  const progress = todos.length ? Math.round((completed / todos.length) * 100) : 0;

  const onAddTodo = () => {
    const value = draft.trim();
    if (!value) return;

    onChange([...todos, { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title: value, completed: false }]);
    setDraft("");
  };

  const onToggle = (id: string) => {
    onChange(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const onDelete = (id: string) => {
    onChange(todos.filter((todo) => todo.id !== id));
  };

  return (
    <section id="todo" className="scroll-mt-40">
      <SectionTitle
        eyebrow="出发前准备"
        title="待办"
        description="管理行前准备事项，支持添加、勾选、删除；变更会自动写入浏览器本地存储。"
      />

      <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            <span className="font-semibold text-[var(--color-text)]">{completed}</span> / {todos.length} 已完成
          </p>
          {progress === 100 ? (
            <span className="rounded-full bg-[var(--color-soft)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">准备就绪！🎀</span>
          ) : null}
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-[var(--color-soft)]">
          <div className="h-full rounded-full bg-[var(--color-primary)] transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mb-5 flex flex-col gap-2 md:flex-row">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="添加一个待办事项"
            className="min-h-11 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
          />
          <button
            type="button"
            onClick={onAddTodo}
            className="min-h-11 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            添加
          </button>
        </div>

        {todos.length ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] px-3 py-2">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[var(--color-text)]">
                  <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} className="h-4 w-4 accent-[var(--color-primary)]" />
                  <span className={todo.completed ? "text-[var(--color-text-secondary)] line-through" : ""}>{todo.title}</span>
                </label>
                <button
                  type="button"
                  onClick={() => onDelete(todo.id)}
                  className="rounded-lg px-2 py-1 text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">暂时还没有需要准备的事项。</p>
          </div>
        )}
      </div>
    </section>
  );
}
