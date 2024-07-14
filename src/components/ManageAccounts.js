import React, { useState, useEffect } from 'react';
import { Card, Typography, Grid, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { ThemeProvider, styled } from '@mui/material/styles';
import { CommonContainer, RowContainer, StyledButton, StyledButtonLabel } from '../styles/CommonStyles';
import { theme } from '../styles/CommonStyles';

const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: 'none',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            console.log('Fetching accounts...');
            const response = await fetch('http://localhost:8080/account');
            const data = await response.json();
            console.log('Fetched accounts:', data);
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleOpen = () => {
        setSelectedAccount({
            type: 'Savings',
            org: 'Scotia',
            initialBalance: '',
            currency: 'CAD',
        });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedAccount({ ...selectedAccount, [name]: value });
    };

    const handleSave = async () => {
        const url = 'http://localhost:8080/account';
        const method = 'POST';

        try {
            console.log('Saving account:', selectedAccount);
            await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(selectedAccount)
            });
            console.log('Account saved, fetching updated accounts...');
            setTimeout(fetchAccounts, 500);  // Adding a slight delay before fetching updated accounts
            setOpen(false);   // Close the dialog
        } catch (error) {
            console.error('Error saving account:', error);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CommonContainer>
                <RowContainer>
                    <StyledButtonLabel>
                        Add Account
                        <StyledButton onClick={handleOpen} />
                    </StyledButtonLabel>
                </RowContainer>
                <Grid container spacing={4}>
                    {accounts.map(account => (
                        <Grid item xs={12} sm={6} md={4} key={account.id}>
                            <StyledCard>
                                <Typography variant="h5" component="div" gutterBottom>
                                    {account.org}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {account.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Balance: ${account.balance.toFixed(2)}
                                </Typography>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
                {selectedAccount && (
                    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                label="Account Type"
                                type="text"
                                fullWidth
                                name="type"
                                value={selectedAccount.type}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Organization"
                                type="text"
                                fullWidth
                                name="org"
                                value={selectedAccount.org}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Initial Balance"
                                type="number"
                                fullWidth
                                name="initialBalance"
                                value={selectedAccount.initialBalance}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Currency"
                                type="text"
                                fullWidth
                                name="currency"
                                value={selectedAccount.currency}
                                onChange={handleChange}
                                disabled
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </CommonContainer>
        </ThemeProvider>
    );
};

export default ManageAccounts;