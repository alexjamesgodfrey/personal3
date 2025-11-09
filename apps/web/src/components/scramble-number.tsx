// components/scramble-number.tsx
export default function ScrambleNumber() {
  return (
    <span className="scramble-number">
      50
      <style>{`
        @keyframes scramble {
          0%, 100% { content: '50'; }
          10% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          20% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          30% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          40% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          50% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          60% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          70% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          80% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
          90% { content: '${Math.floor(Math.random() * 60 + 20)}'; }
        }
      `}</style>
    </span>
  );
}
