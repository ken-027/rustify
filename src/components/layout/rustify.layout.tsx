"use client";

import CheckIcon from "@/components/icon/check.icon";
import CopyIcon from "@/components/icon/copy.icon";
import TrashIcon from "@/components/icon/trash.icon";
import { useEffect, useRef, useState } from "react";

export default function RustifyLayout() {
  const [response, setResponse] = useState<string>("");
  const [streaming, setStreaming] = useState<boolean>(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const outputCodeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [limit, setLimit] = useState<number | null>(null);

  const fetchLimit = async () => {
    const response = await fetch("/api/limit");
    const data = await response.json();
    setLimit(data.remaining);
  };

  const fetchStream = async () => {
    const code = codeRef.current?.value;
    if (!code || code?.trim() === "") {
      alert("Please enter some code to convert.");
      return;
    }

    setResponse("");
    setStreaming(true);

    const res = await fetch("/api/stream", {
      body: JSON.stringify({ code }),
      method: "POST",
    });

    if (res.status === 429) {
      alert("Conversion limit exceeded. Please try again tomorrow.");
      setStreaming(false);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    let done = false;
    while (!done && reader) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunk = decoder.decode(value);
      setResponse((prev) => prev + chunk);
    }

    setStreaming(!done);
    if (done) {
      fetchLimit();
    }
  };

  const onCopy = async () => {
    const textToCopy = outputCodeRef.current?.textContent || "";

    if (textToCopy === "") {
      alert("Nothing to copy!");
      return;
    }

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  const onClear = () => {
    if (!codeRef.current) return;

    codeRef.current.value = "";
  };

  useEffect(() => {
    if (codeRef.current) codeRef.current.value = "console.log('Hello World');";
    fetchLimit();
  }, []);

  return (
    <div className="whitespace-pre-wrap pb-2">
      <div className="p-4 bg-blue-400 border-b-1 border-blue-600 text-gray-900">
        <h1 className="text-center text-2xl">
          <span className="wave">🖐️</span> Welcome to Rustify
        </h1>
        <p className="text-center">Where JS or TS code convert to rust</p>
      </div>
      <div className="p-4 lg:flex max-w-[1200px] gap-4 mx-auto lg:mt-10">
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="user_prompt" className="font-bold lg:text-lg">
            Source Code <span className="text-yellow-500">JS</span> or{" "}
            <span className="text-blue-500">TS</span>
          </label>
          <div className="relative w-full h-full">
            <button
              className="outline-none h-fit  absolute top-1 right-1"
              onClick={onClear}
            >
              <TrashIcon />
            </button>
            <textarea
              ref={codeRef}
              className="border-1 outline-none resize-none focus:border-yellow-500 bg-yellow-100 transition-colors duration-500 border-gray-500 min-h-[400px] h-full w-full rounded-md p-2 placeholder:italic"
              name="user_prompt"
              id="user_prompt"
              placeholder="your source code here..."
            ></textarea>
          </div>
          <button
            disabled={streaming}
            className="outline-none border-1 bg-yellow-100 font-bold rounded-md py-2 cursor-pointer border-gray-500"
            onClick={fetchStream}
          >
            {streaming ? "Converting..." : "Convert"}
          </button>
        </div>
        <div className="flex flex-col mt-5 lg:mt-0 gap-2 items-start flex-1">
          <label htmlFor="user_prompt" className="font-bold lg:text-lg">
            Converted Code <span className="text-gray-700">Rust</span>
          </label>

          <div className="relative w-full bg-green-50 flex">
            <button
              className="outline-none absolute top-1 right-1"
              onClick={onCopy}
            >
              {copied ? (
                <CheckIcon className="scale-90 text-green-700" />
              ) : (
                <CopyIcon className="scale-90" />
              )}
            </button>
            <code
              ref={outputCodeRef}
              id="converted_code"
              className="border-1 p-3 focus:border-green-500 border-green-800 w-full min-h-[400px] lg:min-h-[700px] rounded-md overflow-y-auto max-h-[600px]"
            >
              {response}
            </code>
          </div>
        </div>
      </div>
      <a
        href="https://www.programiz.com/rust/online-compiler/"
        className="block text-center text-blue-500 font-bold text-lg"
        target="_blank"
      >
        Test the code
      </a>
      <p className="text-center">
        Remaining conversion today: <strong>{limit}</strong>
      </p>
    </div>
  );
}
