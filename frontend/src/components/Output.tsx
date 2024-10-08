//@ts-nocheck
import { useSearchParams } from "react-router-dom";

export const Output = () => {
  const [searchParams] = useSearchParams();
  const replId = searchParams.get("replId") ?? "";
  // const INSTANCE_URI = `http://${replId}.autogpt-cloud.com`;
  // const INSTANCE_URI = `http://${replId}.editor.work.gd`;
  const INSTANCE_URI = `https://${replId}.replit.dhruvilspace.site`;

  return (
    <div style={{ height: "40vh", background: "white" }}>
      <iframe width={"100%"} height={"100%"} src={`${INSTANCE_URI}`} />
    </div>
  );
};
