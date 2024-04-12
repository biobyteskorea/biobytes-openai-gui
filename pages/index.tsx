import Image from "next/image";
import { useEffect, useRef, useState } from 'react';
import { MdScheduleSend, MdSend } from "react-icons/md";

interface Response {
  type: 'text' | 'image' | 'error';
  message?: string;
  url?: string;
}
interface Request {
  type: 'request';
  prompt: string;
}

export default function Home() {
  const [apiKey, setApiKey] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(0);
  const [error, setError] = useState(false);
  const [messages, setMessages] = useState<(Response | Request)[]>([]);
  const msgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiKey(localStorage.getItem('apiKey') || '');
  }, []);

  const fetcher = async () => {
    fetch(`/api/calc/${type}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, apiKey }),
    }).then(res => res.json()).then((res) => {
      setLoading(false);
      if (res.error) {
        messages[messages.length - 1] = { type: 'error', message: res.error.message, }
        setMessages([...messages]);
        setError(true);
        return;
      }
      console.log(res);
      messages.pop();
      if (type == 0) {
        messages.push({ type: 'text', message: res.choices[0].message.content, })
        setMessages([...messages]);
        setError(false);
      } else if (type == 1) {
        messages.push({ type: 'text', message: res.data[0].revised_prompt, })
        messages.push({ type: 'image', url: res.data[0].url, })
        setMessages([...messages]);
        setError(false);
        console.log(messages)
      }
      setTimeout(() => {
        msgRef.current?.scrollTo(0, msgRef.current.scrollHeight);
      }, 100);
      setMessages([...messages]);
    }).catch(error => {
      console.log(error);
      setMessages([...messages.slice(0, messages.length - 1), {
        type: 'error',
        message: error.code?.replace(/_/g, ' ')
      }]);
    });
  };

  const handleClick = async () => {
    setPrompt('');
    setTimeout(() => {
      msgRef.current?.scrollTo(0, msgRef.current.scrollHeight);
    }, 100);
    setLoading(true);
    if (!apiKey) {
      setError(true);
      setLoading(false);
      return setMessages([...messages, {
        type: 'text',
        message: "Please enter an API key",
      }]);
    }
    localStorage.setItem('apiKey', apiKey);
    messages.push({ type: 'request', prompt })
    messages.push({ type: 'text', message: 'Loading...' })
    setMessages([...messages]);
    fetcher();
  };

  return (
    <main className="bg-gradient-to-b min-h-screen flex items-center justify-center from-gray-300 to-gray-100 p-2">
      <div className="md:w-2/4 mx-auto">
        <h2 className="font-bold text-5xl z-10 relative">
          OpenAI API GUI
        </h2>
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-400 text-black mb-10 cursor-pointer z-0"
          placeholder="INSERT API KEY : "
          defaultValue={apiKey}
        />
        <div className="bg-gray-50 rounded">
          <div className="p-5 h-[600px] overflow-auto flex flex-col gap-2" ref={msgRef}>
            {messages.map((e, i) => {
              return <div className={`flex ${e.type == 'request' ? 'justify-end' : 'justify-start'}`} key={i}>
                {e.type == 'request'
                  ? <span className="bg-emerald-100 py-1 px-3 rounded">{e.prompt}</span>
                  : e.type == 'text'
                    ? <span className="bg-emerald-50 py-1 px-3 rounded">{e.message}</span>
                    : e.type == 'image'
                      ? <div className="w-1/2 p-3">
                        <Image src={e.url || ''} alt="Generated Image" width={1800} height={1000} className="w-full" />
                      </div>
                      : e.type == 'error'
                        ? <span className="bg-rose-300 py-1 px-2 rounded">{e.message}</span>
                        : null}
              </div>
            })}
          </div>
          <div className="flex gap-2 bg-slate-300 p-2 rounded-b">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { handleClick(); }
              }}
              placeholder="Write your prompt.."
              className="p-2 w-full rounded bg-gray-600 text-white"
            />
            <button
              onClick={handleClick}
              disabled={loading || prompt.length === 0}
              className="p-2 text-lg text-gray-100 rounded-full hover:opacity-90 bg-teal-700 font-semibold flex justify-center items-center disabled:opacity-50"
            >
              {loading ? <MdScheduleSend size={20} /> : <MdSend size={20} />}
            </button>
          </div>
        </div>

        <div className="mx-auto">
          <button
            onClick={() => setType(0)}
            className="button"
            disabled={type == 0}
          >
            CHAT
          </button>
          <button
            onClick={() => setType(1)}
            className="button"
            disabled={type == 1}
          >
            IMAGE
          </button>
        </div>


      </div>
    </main>
  );
}
