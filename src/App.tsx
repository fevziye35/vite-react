import { ChatWindow } from './components/chat/ChatWindow';
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Globe, Building2, Save, ArrowLeft, Printer, LayoutDashboard, LogOut, Trash2, Edit, X, MessageSquare } from 'lucide-react';

// TEK VE DOĞRU SUPABASE IMPORT SATIRI BU OLMALI:
import { supabase } from './lib/supabaseClient';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import LoginPage from './pages/LoginPage';
import DealsPage from './pages/DealsPage';
import MessagesPage from './pages/MessagesPage';