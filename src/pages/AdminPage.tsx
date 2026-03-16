import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Shield, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// useAuth satırı hata verirse klasör adını 'contexts' olarak dene.