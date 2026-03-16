import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Shield, Trash2, Edit2 } from 'lucide-react'; // Kullanılmayanları sildik
import { useAuth } from '../context/AuthContext';

// Eğer hata devam ederse useAuth satırını şununla değiştirip dene:
// import { useAuth } from '@/context/AuthContext';