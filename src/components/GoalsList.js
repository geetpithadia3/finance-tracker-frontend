import React, { useEffect, useState } from 'react';
import { Card, Typography, CircularProgress, Grid, Box, Button, Tooltip, Dialog, DialogActions, DialogContent, TextField } from '@mui/material';
import { ThemeProvider, styled } from '@mui/material/styles';
import { CommonContainer, RowContainer, StyledButton, StyledButtonLabel } from '../styles/CommonStyles';
import { format } from 'date-fns';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../styles/CommonStyles';
import { theme } from '../styles/CommonStyles'


// Styled components for enhanced design
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 0,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.grey[300]}`,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
}));

const ProgressCircleBackground = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.grey[300],
}));

const ProgressCircleForeground = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.primary.main,
    position: 'absolute',
    left: 0,
}));

const ProgressText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 'bold',
}));

const InfoBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
}));

const InfoIcon = styled(Box)(({ theme }) => ({
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

const InfoText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const InfoRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
}));

const GoalsList = () => {
    const [goals, setGoals] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState({
        name:'',
        description:'',
        amountTarget:0,
        amountProgress:0,
        targetDate: format(new Date(), 'yyyy-MM-dd')
    });
    const [openAdd, setOpenAdd] = useState(false);
    const [openUpdate, setOpenUpdate] = useState(false);
    const [isEditing, setEditing] = useState(false);

    function fetchGoals(){
        fetch('http://localhost:8080/goal')
            .then(response => response.json())
            .then(data => setGoals(data))
            .catch(error => console.error('Error fetching goals:', error));
    }

    useEffect(() => {
        fetchGoals()
    }, []);


    const handleOpenAdd = () => {
        console.log(selectedGoal)
        setSelectedGoal({
            name:'',
            description:'',
            amountTarget:0,
            amountProgress:0,
            targetDate:format(new Date(), 'yyyy-MM-dd')
        });
        console.log(selectedGoal)
        setOpenAdd(true);
    };

    const handleCloseAdd = () => {
        setOpenAdd(false);
    };

    const handleOpenUpdate = (goal) => {
        setSelectedGoal({...goal, updatedOn: format(new Date(selectedGoal.targetDate), 'yyyy-MM-dd')});
        setOpenUpdate(true);
    };

    const handleCloseUpdate = () => {
        setOpenUpdate(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSelectedGoal({ ...selectedGoal, [name]: value });
    };

    const handleUpdate = async () => {
        const url = 'http://localhost:8080/goal/update';
        const method = 'POST';

        try {
            console.log('Goal:', selectedGoal);
            await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    goalId: selectedGoal.id,
                    amount: selectedGoal.amount,
                    updatedOn: selectedGoal.updatedOn
                })
            });
            console.log('Goal saved, fetching updated goal...');
            setTimeout(fetchGoals, 500);  // Adding a slight delay before fetching updated accounts
            setOpenUpdate(false);   // Close the dialog
        } catch (error) {
            console.error('Error saving account:', error);
        }
    }

    const handleSave = async () => {
            const url = 'http://localhost:8080/goal';
            const method = 'POST';
    
            try {
                console.log('Goal:', selectedGoal);
                await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(selectedGoal)
                });
                console.log('Goal saved, fetching updated goal...');
                setTimeout(fetchGoals, 500);  // Adding a slight delay before fetching updated accounts
                setOpenAdd(false);   // Close the dialog
            } catch (error) {
                console.error('Error saving account:', error);
            }
    
       
    };

    return (
        <ThemeProvider theme={theme}>
            <CommonContainer>
                <RowContainer>
                    <StyledButtonLabel>New Goal
                <StyledButton onClick={handleOpenAdd}></StyledButton></StyledButtonLabel>
                </RowContainer>
                <Grid container spacing={4}>
                    {goals.map(goal => (
                        <Grid item xs={12} sm={6} md={4} key={goal.id}>
                            <StyledCard variant="outlined">
                                <Typography variant="h5" component="div" gutterBottom>
                                    {goal.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {goal.description}
                                </Typography>
                                <Box position="relative" display="inline-flex" marginBottom={2}>
                                    <ProgressCircleBackground variant="determinate" value={100} size={80} thickness={5} />
                                    <ProgressCircleForeground variant="determinate" value={(goal.amountProgress / goal.amountTarget) * 100} size={80} thickness={5} />
                                    <Box
                                        top={0}
                                        left={0}
                                        bottom={0}
                                        right={0}
                                        position="absolute"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <ProgressText variant="body2" component="div">
                                            {`${(goal.amountProgress / goal.amountTarget * 100).toFixed(2)}%`}
                                        </ProgressText>
                                    </Box>
                                </Box>
                                <InfoBox>
                                    <Tooltip title="Target Date" arrow>
                                        <InfoIcon><EventIcon /></InfoIcon>
                                        <InfoText variant="body2">{format(new Date(goal.targetDate), 'MMM dd, yyyy')}</InfoText>
                                    </Tooltip>
                                </InfoBox>
                                <InfoRow>
                                    <InfoBox>
                                        <Tooltip title="To Save" arrow>
                                            <InfoIcon><AttachMoneyIcon /></InfoIcon>
                                            <InfoText variant="body2">${goal.amountTarget.toFixed(2)}</InfoText>
                                        </Tooltip>
                                    </InfoBox>
                                    <InfoBox>
                                        <Tooltip title="Until Now" arrow>
                                            <InfoIcon><TrendingUpIcon /></InfoIcon>
                                            <InfoText variant="body2">${goal.amountProgress.toFixed(2)}</InfoText>
                                        </Tooltip>
                                    </InfoBox>
                                    <InfoBox>
                                        <Tooltip title="To Save Per Pay Period" arrow>
                                            <InfoIcon><SavingsIcon /></InfoIcon>
                                            <InfoText variant="body2">${goal.amountPerPayPeriod.toFixed(2)}</InfoText>
                                        </Tooltip>
                                    </InfoBox>
                                </InfoRow>
                                <InfoBox>
                                    {/* <IconButton style={{ marginTop: '20px', textTransform: 'none' }}>
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </IconButton> */}

                                    <IconButton style={{ marginTop: '20px', textTransform: 'none' }} onClick={()=>handleOpenUpdate(goal)}>
                                        <FontAwesomeIcon icon={faPencil} />
                                    </IconButton>

                                </InfoBox>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
                {selectedGoal && openAdd && (
                    <Dialog open={openAdd} onClose={handleCloseAdd} maxWidth="xs" fullWidth>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                label="Name"
                                type="text"
                                fullWidth
                                name="name"
                                value={selectedGoal.name}
                                onChange={handleChange}
                                disabled={isEditing}
                            />
                            <TextField
                                margin="dense"
                                label="Description"
                                type="text"
                                fullWidth
                                name="description"
                                value={selectedGoal.description}
                                onChange={handleChange}
                                disabled={isEditing}
                            />
                            <TextField
                                margin="dense"
                                label="Target Date"
                                type="date"
                                fullWidth
                                name="targetDate"
                                value={selectedGoal.targetDate}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                disabled={isEditing}
                            />
                            <TextField
                                margin="dense"
                                label="Target Amount"
                                type="number"
                                fullWidth
                                name="amountTarget"
                                value={selectedGoal.amountTarget}
                                onChange={handleChange}
                                disabled={isEditing}
                            />
                            <TextField
                                margin="dense"
                                label="Amount Progress"
                                type="number"
                                fullWidth
                                name="amountProgress"
                                value={selectedGoal.amountProgress}
                                onChange={handleChange}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseAdd} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleSave} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
                {selectedGoal && openUpdate && (
                    <Dialog open={openUpdate} onClose={handleCloseUpdate} maxWidth="xs" fullWidth>
                        <DialogContent>
                            <TextField
                                margin="dense"
                                label="Name"
                                type="text"
                                fullWidth
                                name="name"
                                disabled
                                value={selectedGoal.name}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Progress"
                                type="number"
                                fullWidth
                                name="amount"
                                value={selectedGoal.amount}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Updated On"
                                type="date"
                                fullWidth
                                name="updatedOn"
                                value={selectedGoal.updatedOn}
                                onChange={handleChange}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseUpdate} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleUpdate} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                )}
            </CommonContainer>
        </ThemeProvider>
    );
};

export default GoalsList;
