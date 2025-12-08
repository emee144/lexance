"use client";

import Image from "next/image";

export default function AnimatedCard() {
  return (
    <div className="w-full overflow-hidden bg-gray-500/10 py-8">
      <div className="flex animate-marquee">
        
        <div className="flex shrink-0 items-center gap-x-8">
          <Image src="/mark1.png" alt="mark 1" width={300} height={300} />
          <Image src="/mark2.jpeg" alt="mark 2" width={300} height={300} />
          <Image src="/mark4.jpeg" alt="mark 4" width={300} height={300} />
        </div>

        <div className="flex shrink-0 items-center gap-x-8 ml-8">
          <Image src="/mark1.png" alt="mark 1" width={300} height={300} />
          <Image src="/mark2.jpeg" alt="mark 2" width={300} height={300} />
          <Image src="/mark4.jpeg" alt="mark 4" width={300} height={300} />
        </div>

      </div>
    </div>
  );
}
