import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { getAuthHeaders } from '../utils/auth';

const Profile = () => {
  const [payAmount, setPayAmount] = useState('');
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [externalKey, setExternalKey] = useState('');
  const [estimatedMonthlyIncome, setEstimatedMonthlyIncome] = useState(0);

  useEffect(() => {
    // Calculate estimated monthly income when pay amount changes
    const biweeklyAmount = parseFloat(payAmount) || 0;
    const monthlyEstimate = (biweeklyAmount * 26) / 12;
    setEstimatedMonthlyIncome(monthlyEstimate);
  }, [payAmount]);

  const onFinish = async (values) => {
    try {
      const response = await fetch('http://localhost:8080/user/external-credentials', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ externalKey })
      });
      if (response.ok) {
        message.success('Profile updated successfully');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="income" className="w-full">
        <TabsList>
          <TabsTrigger value="income">Income Configuration</TabsTrigger>
          <TabsTrigger value="external">External Services</TabsTrigger>
        </TabsList>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>Income Configuration</CardTitle>
              <CardDescription>Set up your regular income details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payAmount">Pay Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="payAmount"
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="pl-8"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextPayDate">Next Pay Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !nextPayDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextPayDate ? format(nextPayDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={nextPayDate}
                      onSelect={setNextPayDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {payAmount && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm">
                    Based on your bi-weekly income of ${payAmount}, your estimated monthly income is ${estimatedMonthlyIncome.toFixed(2)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="external">
          <Card>
            <CardHeader>
              <CardTitle>External Services</CardTitle>
              <CardDescription>Configure your external service connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="splitwiseKey">Splitwise Secret</Label>
                <Input
                  id="splitwiseKey"
                  type="password"
                  value={externalKey}
                  onChange={(e) => setExternalKey(e.target.value)}
                />
              </div>
              <Button className="mt-4" onClick={onFinish}>
                Update External Services
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;