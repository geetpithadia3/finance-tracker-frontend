import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { getAuthHeaders } from '../utils/auth';

const ShareTransactionDialog = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onShare 
}) => {
  const [splitMethod, setSplitMethod] = useState('equal');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [customAmounts, setCustomAmounts] = useState({});
  const [shares, setShares] = useState({});
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('http://localhost:8080/user/friends', {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    };

    fetchFriends();
  }, []);

  const handleFriendSelect = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
      // Clear custom amounts/shares when removing friend
      const { [friendId]: _, ...restAmounts } = customAmounts;
      setCustomAmounts(restAmounts);
      const { [friendId]: __, ...restShares } = shares;
      setShares(restShares);
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };

  const handleShareSubmit = () => {
    const splitData = {
      method: splitMethod,
      friends: selectedFriends,
      ...(splitMethod === 'custom' && { amounts: customAmounts }),
      ...(splitMethod === 'shares' && { shares }),
    };
    onShare(splitData);
  };

  const calculateSplitAmount = () => {
    if (!transaction || selectedFriends.length === 0) return 0;
    return transaction.amount / (selectedFriends.length + 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="space-y-2">
            <Label>Description</Label>
            <p className="text-sm font-medium">{transaction?.description}</p>
            <Label>Amount</Label>
            <p className="text-sm font-medium">${transaction?.amount}</p>
          </div>

          {/* Friends Selection */}
          <div className="space-y-2">
            <Label>Split With</Label>
            <ScrollArea className="h-[100px] border rounded-md p-2">
              <div className="space-y-2">
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className="flex items-center space-x-2"
                    onClick={() => handleFriendSelect(friend.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => {}}
                      className="rounded border-gray-300"
                    />
                    <span>{friend.firstName} {friend.lastName}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Friends Tags */}
          {selectedFriends.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedFriends.map(friendId => {
                const friend = friends.find(f => f.id === friendId);
                return (
                  <Badge key={friendId} variant="secondary">
                    {friend.firstName} {friend.lastName}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => handleFriendSelect(friendId)}
                    />
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Split Method Selection */}
          <div className="space-y-2">
            <Label>Split Method</Label>
            <RadioGroup
              value={splitMethod}
              onValueChange={setSplitMethod}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal">
                  Split Equally (${calculateSplitAmount().toFixed(2)} each)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shares" id="shares" />
                <Label htmlFor="shares">Split by Shares</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom Amount</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Custom Split Options */}
          {splitMethod !== 'equal' && selectedFriends.length > 0 && (
            <div className="space-y-4">
              {selectedFriends.map(friendId => {
                const friend = friends.find(f => f.id === friendId);
                return (
                  <div key={friendId} className="space-y-2">
                    <Label>{friend.firstName} {friend.lastName}</Label>
                    <Input
                      type="number"
                      value={splitMethod === 'custom' ? 
                        customAmounts[friendId] || '' : 
                        shares[friendId] || ''}
                      onChange={(e) => {
                        if (splitMethod === 'custom') {
                          setCustomAmounts(prev => ({
                            ...prev,
                            [friendId]: e.target.value
                          }));
                        } else {
                          setShares(prev => ({
                            ...prev,
                            [friendId]: e.target.value
                          }));
                        }
                      }}
                      placeholder={splitMethod === 'custom' ? "Amount" : "Shares"}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleShareSubmit}>Share on Splitwise</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTransactionDialog;