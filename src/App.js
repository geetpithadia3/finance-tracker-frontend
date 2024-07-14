import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Navigate } from 'react-router-dom';
import SyncTransactions from './components/SyncTransactions';
import TransactionsList from './components/TransactionsList';
import GoalsList from './components/GoalsList';
import { Drawer, List, ListItem, ListItemText, CssBaseline, Divider, ListItemIcon, Typography } from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FlagIcon from '@mui/icons-material/Flag';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ThemeProvider, styled } from '@mui/material/styles';
import { theme } from './styles/CommonStyles'
import ManageAccounts from './components/ManageAccounts';

const drawerWidth = 240;

const AppContainer = styled('div')(({ theme }) => ({
    display: 'flex',
}));

const AppContent = styled('main')(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
  
}));

const DrawerStyled = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
    },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    ...theme.mixins.toolbar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledNavLink = styled(NavLink)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
    '&.active': {
        backgroundColor: theme.palette.action.selected,
    },
}));

const drawer = (
    <div>
        <DrawerHeader>
            <Typography variant="h6" noWrap>
                FINANCE TRACKER
            </Typography>
        </DrawerHeader>
        <Divider />
        <List>
            <ListItem button component={StyledNavLink} to="/accounts">
                <ListItemIcon><CloudUploadIcon /></ListItemIcon>
                <ListItemText primary="ACCOUNTS" />
            </ListItem>
            <ListItem button component={StyledNavLink} to="/csv-uploader">
                <ListItemIcon><CloudUploadIcon /></ListItemIcon>
                <ListItemText primary="SYNC" />
            </ListItem>
            <ListItem button component={StyledNavLink} to="/transactions" exact>
                <ListItemIcon><ListAltIcon /></ListItemIcon>
                <ListItemText primary="EXPENSES" />
            </ListItem>
            <ListItem button component={StyledNavLink} to="/goals">
                <ListItemIcon><FlagIcon /></ListItemIcon>
                <ListItemText primary="GOALS" />
            </ListItem>

        </List>
    </div>
);

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <AppContainer>
                    <CssBaseline />
                    <DrawerStyled variant="permanent" open>
                        {drawer}
                    </DrawerStyled>
                    <AppContent>
                        <Routes>
                            <Route path="/" element={<Navigate to="/accounts" />} />
                            <Route path="/csv-uploader" element={
                                <SyncTransactions/>
                            } />
                            <Route path="/transactions" element={<TransactionsList />} />
                            <Route path="/goals" element={<GoalsList />} />
                            <Route path="/accounts" element={<ManageAccounts />} />
                        </Routes>
                    </AppContent>
                </AppContainer>
            </Router>
        </ThemeProvider>
    );
};

export default App;
