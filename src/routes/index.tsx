import { Title } from "@solidjs/meta";
import { clientOnly } from "@solidjs/start";

const Viewbox = clientOnly(() => import("~/components/Viewbox"));
const WebcamControls = clientOnly(() => import("~/components/WebcamControls"));

export default function Home() {
  return (
    <main>
      <Title>Horizontal Waves</Title>
      <Viewbox />
      <WebcamControls />
    </main>
  );
}
