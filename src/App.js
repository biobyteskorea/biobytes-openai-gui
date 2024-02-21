import { useState } from "react";
import OpenAI from "openai";
import './App.css'


function App() {
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(0);
  const [error, setError] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try {
      if (!apiKey) {
        setError('Need API Key');
      } else {
        const openai = new OpenAI({
          apiKey: apiKey || process.env.REACT_APP_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true,
        });
        if (type == 0) {
          const res = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.5,
            max_tokens: 100,
          });
          setResult(res.choices[0].message.content);
          setError(false);
        } else if (type == 1) {
          const res = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1024x1024',
          })
          setResult(res.data[0].url);
          setError(false);
        }
      }
    } catch (error) {
      setError(error.code.replace(/_/g, ' '));
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <main className="main">
      <div className="w-2/4 mx-auto">
        <h2 className="font-bold text-5xl text-slate-1000 z-10 relative">
          OpenAI API GUI
        </h2>
        <input
          type="text"
          className="input"
          placeholder="INSERT API KEY : "
          onChange={e => setApiKey(e.target.value)} />
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

        <textarea
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Write your prompt.."
          className="textarea"
        />

        <button
          onClick={handleClick}
          disabled={loading || prompt.length === 0}
          className="btn"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
        {error || type == 0 ?
          <pre className="text-red bg-slate-500 min-h-20 p-3 rounded">{error || result}</pre>
          : type == 1 ? <img src={result} className="w-full" />
            : <></>
        }


      </div>
    </main>
  );
}

export default App;