import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'grbs' | 'viewer';
  department: string;
}

interface FinancialIndicator {
  id: number;
  name: string;
  planned: number;
  actual: number;
  period: string;
  responsible: string;
  department: string;
}

const budgetData = [
  { month: 'Янв', plan: 120, fact: 115 },
  { month: 'Фев', plan: 130, fact: 128 },
  { month: 'Мар', plan: 140, fact: 135 },
  { month: 'Апр', plan: 135, fact: 138 },
  { month: 'Май', plan: 145, fact: 142 },
  { month: 'Июн', plan: 150, fact: 148 },
];

const departmentData = [
  { name: 'Образование', value: 450 },
  { name: 'Здравоохранение', value: 380 },
  { name: 'Культура', value: 180 },
  { name: 'Спорт', value: 120 },
  { name: 'Социальная защита', value: 280 },
];

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [users] = useState<User[]>([
    { id: 1, name: 'Иванов Иван', email: 'ivanov@grbs.ru', role: 'admin', department: 'Администрация' },
    { id: 2, name: 'Петрова Мария', email: 'petrova@grbs.ru', role: 'grbs', department: 'Образование' },
    { id: 3, name: 'Сидоров Петр', email: 'sidorov@grbs.ru', role: 'grbs', department: 'Здравоохранение' },
  ]);

  const [indicators] = useState<FinancialIndicator[]>([
    { id: 1, name: 'Расходы на образование', planned: 450000000, actual: 425000000, period: 'Q1 2024', responsible: 'Петрова М.', department: 'Отдел бюджетного планирования' },
    { id: 2, name: 'Расходы на здравоохранение', planned: 380000000, actual: 378000000, period: 'Q2 2024', responsible: 'Сидоров П.', department: 'Отдел бюджетного учета' },
    { id: 3, name: 'Расходы на культуру', planned: 180000000, actual: 175000000, period: 'Q3 2024', responsible: 'Иванов И.', department: 'Отдел казначейства' },
    { id: 4, name: 'Расходы на спорт', planned: 120000000, actual: 118000000, period: 'Q2 2024', responsible: 'Петрова М.', department: 'Отдел бюджетного планирования' },
    { id: 5, name: 'Расходы на социальную защиту', planned: 280000000, actual: 275000000, period: 'Q1 2024', responsible: 'Сидоров П.', department: 'Отдел бюджетного учета' },
    { id: 6, name: 'Инфраструктурные проекты', planned: 320000000, actual: 310000000, period: 'Q3 2024', responsible: 'Иванов И.', department: 'Отдел казначейства' },
  ]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedIndicatorDept, setSelectedIndicatorDept] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedUserRole, setSelectedUserRole] = useState<string>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
    setCurrentUser(users[0]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculateExecution = (planned: number, actual: number) => {
    return ((actual / planned) * 100).toFixed(1);
  };

  const periods = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'];
  const departments = Array.from(new Set(users.map(u => u.department)));
  const indicatorDepartments = Array.from(new Set(indicators.map(i => i.department)));

  const filteredIndicators = indicators.filter(indicator => {
    const periodMatch = selectedPeriod === 'all' || indicator.period === selectedPeriod;
    const deptMatch = selectedIndicatorDept === 'all' || indicator.department === selectedIndicatorDept;
    return periodMatch && deptMatch;
  });

  const filteredUsers = users.filter(user => {
    const roleMatch = selectedUserRole === 'all' || user.role === selectedUserRole;
    const deptMatch = selectedDepartment === 'all' || user.department === selectedDepartment;
    return roleMatch && deptMatch;
  });

  const exportIndicatorsToExcel = () => {
    const exportData = filteredIndicators.map(indicator => ({
      'Наименование': indicator.name,
      'План (руб.)': indicator.planned,
      'Факт (руб.)': indicator.actual,
      'Исполнение (%)': calculateExecution(indicator.planned, indicator.actual),
      'Период': indicator.period,
      'Отдел': indicator.department,
      'Ответственный': indicator.responsible
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Финансовые показатели');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Финансовые_показатели_${date}.xlsx`);
  };

  const exportUsersToExcel = () => {
    const exportData = users.map(user => ({
      'Имя': user.name,
      'Email': user.email,
      'Роль': user.role === 'admin' ? 'Администратор' : user.role === 'grbs' ? 'ГРБС' : 'Наблюдатель',
      'Подразделение': user.department
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Пользователи');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Пользователи_${date}.xlsx`);
  };

  const exportDashboardToExcel = () => {
    const ws1 = XLSX.utils.json_to_sheet(budgetData.map(item => ({
      'Месяц': item.month,
      'План (млн ₽)': item.plan,
      'Факт (млн ₽)': item.fact
    })));
    
    const ws2 = XLSX.utils.json_to_sheet(departmentData.map(item => ({
      'Направление': item.name,
      'Бюджет (млн ₽)': item.value
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Динамика бюджета');
    XLSX.utils.book_append_sheet(wb, ws2, 'Распределение');
    
    const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
    XLSX.writeFile(wb, `Отчет_Dashboard_${date}.xlsx`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary rounded-full p-3">
                <Icon name="Lock" className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">Система финансового менеджмента</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Вход для авторизованных пользователей ГРБС
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@grbs.ru"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Войти в систему
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1A1F2C] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-lg p-2">
                <Icon name="BarChart3" className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Финансовый менеджмент</h1>
                <p className="text-sm text-slate-300">Система управления бюджетом ГРБС</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{currentUser?.name}</p>
                <p className="text-xs text-slate-300">{currentUser?.department}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary">
                  {currentUser?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <Icon name="LogOut" className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Icon name="LayoutDashboard" className="h-4 w-4" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="indicators" className="flex items-center gap-2">
              <Icon name="TrendingUp" className="h-4 w-4" />
              Показатели
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Icon name="Users" className="h-4 w-4" />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Icon name="Settings" className="h-4 w-4" />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={exportDashboardToExcel} variant="outline">
                <Icon name="Download" className="h-4 w-4 mr-2" />
                Экспорт в Excel
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Общий бюджет</CardTitle>
                  <Icon name="Wallet" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.41 млрд ₽</div>
                  <p className="text-xs text-muted-foreground">план на 2024 год</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Исполнено</CardTitle>
                  <Icon name="CheckCircle" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1.10 млрд ₽</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600 font-medium">78%</span> от плана
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Отклонение</CardTitle>
                  <Icon name="AlertCircle" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-2.3%</div>
                  <p className="text-xs text-muted-foreground">от планируемых показателей</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Активных ГРБС</CardTitle>
                  <Icon name="Building2" className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">главных распорядителей</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Динамика исполнения бюджета</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="plan" stroke="#8E9196" name="План" strokeWidth={2} />
                      <Line type="monotone" dataKey="fact" stroke="#0EA5E9" name="Факт" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Распределение по направлениям</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0EA5E9" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="indicators" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle>Финансовые показатели</CardTitle>
                  <div className="flex gap-2 flex-wrap items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Период:</Label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Все периоды" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все периоды</SelectItem>
                          {periods.map(period => (
                            <SelectItem key={period} value={period}>{period}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Отдел:</Label>
                      <Select value={selectedIndicatorDept} onValueChange={setSelectedIndicatorDept}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Все отделы" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все отделы</SelectItem>
                          {indicatorDepartments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={exportIndicatorsToExcel} variant="outline" size="sm">
                      <Icon name="Download" className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                    <Button size="sm">
                      <Icon name="Plus" className="h-4 w-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Наименование</TableHead>
                      <TableHead>План</TableHead>
                      <TableHead>Факт</TableHead>
                      <TableHead>Исполнение</TableHead>
                      <TableHead>Период</TableHead>
                      <TableHead>Отдел</TableHead>
                      <TableHead>Ответственный</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIndicators.map((indicator) => {
                      const execution = parseFloat(calculateExecution(indicator.planned, indicator.actual));
                      return (
                        <TableRow key={indicator.id}>
                          <TableCell className="font-medium">{indicator.name}</TableCell>
                          <TableCell>{formatCurrency(indicator.planned)}</TableCell>
                          <TableCell>{formatCurrency(indicator.actual)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={execution >= 95 ? 'default' : execution >= 85 ? 'secondary' : 'destructive'}
                            >
                              {execution}%
                            </Badge>
                          </TableCell>
                          <TableCell>{indicator.period}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{indicator.department}</TableCell>
                          <TableCell>{indicator.responsible}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle>Управление пользователями</CardTitle>
                  <div className="flex gap-2 flex-wrap items-center">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Роль:</Label>
                      <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Все роли" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все роли</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                          <SelectItem value="grbs">ГРБС</SelectItem>
                          <SelectItem value="viewer">Наблюдатель</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm whitespace-nowrap">Подразделение:</Label>
                      <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="Все подразделения" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все подразделения</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={exportUsersToExcel} variant="outline" size="sm">
                      <Icon name="Download" className="h-4 w-4 mr-2" />
                      Экспорт
                    </Button>
                    <Button size="sm">
                      <Icon name="UserPlus" className="h-4 w-4 mr-2" />
                      Добавить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead>Подразделение</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Администратор' : user.role === 'grbs' ? 'ГРБС' : 'Наблюдатель'}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.department}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Icon name="Trash2" className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки системы</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Общие настройки</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="org-name">Название организации</Label>
                      <Input id="org-name" defaultValue="Министерство финансов" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="fiscal-year">Финансовый год</Label>
                      <Input id="fiscal-year" defaultValue="2024" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Уведомления</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notif">Email уведомления</Label>
                      <input type="checkbox" id="email-notif" className="h-4 w-4" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="report-notif">Отчеты по расписанию</Label>
                      <input type="checkbox" id="report-notif" className="h-4 w-4" defaultChecked />
                    </div>
                  </div>
                </div>

                <Button>Сохранить настройки</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;