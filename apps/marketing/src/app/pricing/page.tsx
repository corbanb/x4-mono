import type { Metadata } from "next";
import { CTA } from "@/components/CTA";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of all sizes.",
};

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    description: "For side projects and experiments.",
    features: [
      "All platform targets (web, mobile, desktop)",
      "Community support",
      "MIT licensed",
    ],
  },
  {
    name: "Pro",
    price: "$49/mo",
    description: "For teams shipping to production.",
    features: [
      "Everything in Starter",
      "Priority support",
      "Private Discord channel",
      "Early access to new features",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with specific needs.",
    features: [
      "Everything in Pro",
      "Dedicated support engineer",
      "Custom integrations",
      "SLA guarantees",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Start free. Upgrade when you&apos;re ready.
        </p>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 px-6 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 text-left ${
                tier.highlighted
                  ? "border-gray-900 ring-1 ring-gray-900"
                  : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {tier.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
              <p className="mt-4 text-3xl font-bold text-gray-900">
                {tier.price}
              </p>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 text-gray-400">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <CTA />
    </>
  );
}
