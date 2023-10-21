"use client";
import { useState } from "react";
import confetti from "canvas-confetti";

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const q = searchParams.q;
  const choices = searchParams.c?.split(",") ?? [];
  const answer = searchParams.a!.split(",").map((x) => parseInt(x));
  const mcq = answer.length > 1;

  const [selected, setSelected] = useState<number | number[] | null>(
    mcq ? [] : null,
  );
  console.log(selected);
  const [disabled, setDisabled] = useState<number[]>([]);
  const [done, setDone] = useState<boolean>(false);

  const haptic = done
    ? ""
    : " transition hover:shadow-md [&:not(:active)]:hover:-translate-x-0.5 [&:not(:active)]:hover:-translate-y-0.5 ";

  const onCorrect = async () => {
    setDone(true);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const k = w + h;
    const c = k / 6;
    const v = k / 26 + h / 40;
    const s = 80;
    const a = (w / h) * 20;
    await Promise.all([
      confetti({
        particleCount: c,
        startVelocity: v,
        spread: s,
        angle: 90 + a,
        origin: {
          x: 1,
          y: 1,
        },
      }),
      confetti({
        particleCount: c,
        startVelocity: v,
        spread: s,
        angle: 90 - a,
        origin: {
          x: 0,
          y: 1,
        },
      }),
    ]);
  };
  const onWrong = () => {
    if (mcq) {
      setSelected([]);
    } else {
      setDisabled((prev) => [...prev, selected as number]);
      setSelected(null);
    }
  };
  const submit = () => {
    if (selected === null) return;
    if (mcq) {
      if (answer.length !== (selected as number[]).length) {
        onWrong();
        return;
      } else if (
        answer.some((x) => {
          return !(selected as number[]).includes(x);
        })
      ) {
        onWrong();
        return;
      } else {
        void onCorrect();
      }
    } else {
      if (selected !== answer[0]) {
        onWrong();
        return;
      } else {
        void onCorrect();
      }
    }
  };
  return (
    <div className="p-4">
      <div
        className={
          "text-l tlg:px-12 mb-4 flex items-center rounded-xl bg-sky-200 px-8 py-3 font-bold text-black lg:py-6" +
          haptic
        }
      >
        {q}
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        {choices.map((choice, i) => {
          return (
            <div
              className={
                "flex-1 rounded-xl border-2 px-8 py-3 text-center font-bold transition lg:px-12 lg:py-6 " +
                (selected === i || (mcq && (selected as number[]).includes(i))
                  ? " bg-sky-300 "
                  : disabled.includes(i)
                  ? " bg-red-300 "
                  : " bg-white ") +
                (disabled.includes(i)
                  ? " border-red-300 text-gray-800 opacity-50  "
                  : " border-sky-300 text-black " +
                    haptic +
                    (done
                      ? ""
                      : " cursor-pointer hover:bg-sky-200 active:bg-sky-300 "))
              }
              key={choice}
              onClick={() => {
                if (disabled.includes(i) || done) return;
                if (mcq) {
                  setSelected((prev) => {
                    prev = prev as number[];
                    if (prev.includes(i)) return prev.filter((x) => x !== i);
                    return [...prev, i];
                  });
                } else {
                  setSelected(i);
                }
              }}
            >
              {choice}
            </div>
          );
        })}
      </div>
      <button
        className={
          haptic +
          "mt-6 w-full rounded-xl  px-8 py-3 font-bold text-white" +
          (done ? " bg-green-300 opacity-50 " : " bg-sky-800")
        }
        onClick={submit}
      >
        Submit
      </button>
    </div>
  );
}
