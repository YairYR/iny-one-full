'use client';

import type React from "react";

export type ProductCard = {
  id: string;
  price: number;
};

export type ProductsCards = {
  pro: ProductCard;
  premium: ProductCard;
  // enterprise: ProductCard;
};

interface Props {
  products: ProductsCards;
  currentPlan?: string;
}

export default function PricingCards({ products }: Props) {
  const { pro, premium } = products;

  const checkoutProduct = async (productId: string) => {
    //
  }

  const onClickBuyPro = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await checkoutProduct(pro.id);
  };

  const onClickBuyPremium = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    await checkoutProduct(premium.id);
  };

  return (
    <div className="flex mx-auto justify-center items-center">
      <div className="flex flex-wrap justify-center gap-6 m-8">
        {/** card 1 */}
        <div className="flex flex-col rounded-2xl w-64 sm:w-72 lg:w-80 bg-[#ffffff] text-[#374151] shadow-xl">
          <figure className="flex justify-center items-center">
            <img
              src="https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png"
              alt="Card Preview" className="rounded-t-2xl"/>
          </figure>
          <div className="flex flex-col p-6 h-full">
            <div className="text-3xl  font-bold pb-6">Basic</div>
            <div className="  text-lg pb-12">Basic features. Get started completely for free.</div>
            <div className="flex flex-col gap-3  text-base">
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div className="font-bold">Core Features</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Limited Storage</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Ticket Support</div>
              </div>
            </div>
            <div className="flex grow"></div>
            <div className="flex pt-10">
              <button
                className="w-full bg-[#7e22ce] text-[#ffffff] font-bold text-base p-3 rounded-lg hover:bg-purple-800 active:scale-95 transition-transform transform">Get
                started - 100% Free
              </button>
            </div>
          </div>
        </div>
        {/** card 2 */}
        <div className="flex flex-col rounded-2xl w-64 sm:w-72 lg:w-80 bg-[#ffffff] text-[#374151] shadow-xl">
          <figure className="flex justify-center items-center">
            <img
              src="https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png"
              alt="Card Preview" className="rounded-t-2xl"/>
          </figure>
          <div className="flex flex-col p-6 h-full">
            <div className="text-3xl  font-bold pb-6">Pro</div>
            <div className="  text-lg pb-12">Get access to advanced features for increased productivity.</div>
            <div className="flex flex-col gap-3  text-base">
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div className="font-bold">All features of the basic plan</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Increased Storage</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Advanced Analytics</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Reporting Tools</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Third-Party Integrations</div>
              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>E-Mail Support</div>
              </div>
            </div>
            <div className="flex grow"></div>
            <div className="flex pt-10">
              <button
                onClick={onClickBuyPro}
                className="w-full bg-[#7e22ce] text-[#ffffff] font-bold text-base p-3 rounded-lg hover:bg-purple-800 active:scale-95 transition-transform transform">Buy
                Pro {pro.price} USD/mo
              </button>
            </div>
          </div>
        </div>
        {/** card 3 */}
        <div className="flex flex-col rounded-2xl w-64 sm:w-72 lg:w-80 bg-[#ffffff] text-[#374151] shadow-xl">
          <figure className="flex justify-center items-center">
            <img
              src="https://tailwind-generator.b-cdn.net/images/card-generator/tailwind-card-generator-card-preview.png"
              alt="Card Preview" className="rounded-t-2xl"/>
          </figure>

          <div className="flex flex-col p-6 h-full">
            <div className="text-3xl  font-bold pb-6">Premium</div>
            <div className="  text-lg pb-12">Exclusive features and priority support for businesses.</div>
            <div className="flex flex-col gap-3  text-base">
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div className="font-bold">All features of the Pro plan</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Unlimited Storage</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>End-to-End Encryption</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Predictive Insights</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Early-Access</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>Dedicated Account Manager</div>

              </div>
              <div className="flex flex-row gap-3">
                <div className="text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                       className="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                </div>
                <div>24/7 Dedicated Customer Support</div>

              </div>
            </div>
            <div className="flex grow"></div>
            <div className="flex pt-10">
              <button
                onClick={onClickBuyPremium}
                className="w-full bg-[#7e22ce] text-[#ffffff] font-bold text-base p-3 rounded-lg hover:bg-purple-800 active:scale-95 transition-transform transform">Buy
                Premium {premium.price} USD/mo
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}