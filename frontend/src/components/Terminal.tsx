//@ts-nocheck
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const fitAddon = new FitAddon();

function ab2str(buf: string) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

const OPTIONS_TERM = {
  useStyle: true,
  screenKeys: true,
  cursorBlink: true,
  cols: 200,
  theme: {
    background: "black",
  },
};

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) {
      return;
    }

    socket.emit("requestTerminal");
    socket.on("terminal", terminalHandler);

    term.current = new Terminal(OPTIONS_TERM);
    term.current.loadAddon(fitAddon);
    term.current.open(terminalRef.current);
    fitAddon.fit();

    term.current.onData((data) => {
      console.log("Typed", data);
      socket.emit("terminalData", {
        data,
      });
    });

    function terminalHandler({ data }: { data: any }) {
      if (data instanceof ArrayBuffer) {
        console.error(data);
        console.log(ab2str(data));
        term.current?.write(ab2str(data));
      }
    }

    socket.emit("terminalData", {
      data: "\n",
    });

    return () => {
      socket.off("terminal", terminalHandler);
      term.current?.dispose();
    };
  }, [terminalRef, socket]);

  console.log(terminalRef);

  useEffect(() => {
    const handleFocus = () => {
      term.current?.focus();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div
      style={{ width: "40vw", height: "400px", textAlign: "left" }}
      ref={terminalRef}
    />
  );
};
