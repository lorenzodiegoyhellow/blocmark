import { Percent, DollarSign, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function CommissionSection() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
      <div className="grid md:grid-cols-2 items-stretch">
        {/* Left side - Content */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 px-4 py-1 rounded-full mb-4">
            <Percent className="h-4 w-4" />
            <span className="text-sm font-medium">Only 10% Total Fees</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Lowest Commission Rates in the Industry
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
            We created this platform to give business opportunities to location owners without the burden of expensive fees. 
            While competitors charge 20-30% commission, we charge only 10% total fees:
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-500">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">5% From Renters</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                A small fee added to the booking total
              </p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-blue-600 dark:text-blue-500">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">5% From Owners</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Deducted from the payout after booking
              </p>
            </div>
          </div>
          
          <Link href="/auth?signup=true">
            <Button size="lg">
              Start Hosting Your Location
            </Button>
          </Link>
        </div>
        
        {/* Right side - Chart */}
        <div className="bg-gray-50 dark:bg-gray-800 p-8 md:p-10 flex flex-col justify-center">
          <h3 className="text-xl font-bold mb-6 text-center">
            Commission Rate Comparison
          </h3>
          
          {/* Bar Chart Visualization */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Blocmark</span>
                <span className="font-semibold text-blue-600 dark:text-blue-500">10%</span>
              </div>
              <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Competitor A</span>
                <span className="font-semibold text-orange-600 dark:text-orange-500">20%</span>
              </div>
              <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Competitor B</span>
                <span className="font-semibold text-red-600 dark:text-red-500">30%</span>
              </div>
              <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start gap-2">
              <BarChart className="h-5 w-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Lower commission rates mean better value for everyone. Hosts earn more, and renters get better prices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}