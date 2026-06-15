import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Target, Users, CheckCircle2, ArrowRight, BarChart3, Zap, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, X } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    { label: "ساعات تدريب", value: "20", icon: Clock },
    { label: "دروس شاملة", value: "12", icon: BookOpen },
    { label: "أسئلة تدريبية", value: "180+", icon: BarChart3 },
    { label: "اختبارات تجريبية", value: "5", icon: Target },
  ];

  const curriculum = [
    {
      week: "الأسبوع الأول",
      title: "المقدمات والأساسيات",
      lessons: [
        "مقدمة عن الحاسب الآلي",
        "مكونات الحاسب - الأجهزة (Hardware)",
        "مكونات الحاسب - البرامج (Software)",
      ],
      hours: 5,
    },
    {
      week: "الأسبوع الثاني",
      title: "نظام التشغيل والملفات",
      lessons: [
        "Windows - المقدمة والواجهة",
        "إدارة الملفات والمجلدات",
      ],
      hours: 4,
    },
    {
      week: "الأسبوع الثالث",
      title: "برامج الإنتاجية",
      lessons: [
        "Microsoft Word - المقدمة والتنسيق",
        "Microsoft Excel - الأساسيات والصيغ",
      ],
      hours: 4,
    },
    {
      week: "الأسبوع الرابع",
      title: "الإنترنت والأمان والمراجعة",
      lessons: [
        "الإنترنت والبريد الإلكتروني",
        "الأمن السيبراني والسلامة الرقمية",
        "الاختصارات والمصطلحات",
        "المراجعة والاختبارات التجريبية",
      ],
      hours: 7,
    },
  ];

  const features = [
    {
      title: "منهج شامل ومنظم",
      description: "12 درس مُنظمة على 4 أسابيع تغطي جميع موضوعات الاختبار",
      icon: BookOpen,
    },
    {
      title: "بنك أسئلة ضخم",
      description: "180+ سؤال متنوع (MCQ، صح/خطأ، عملي) لتقييم فهمك",
      icon: BarChart3,
    },
    {
      title: "اختبارات تجريبية",
      description: "5 اختبارات كاملة تحاكي الاختبار الفعلي",
      icon: Target,
    },
    {
      title: "شرح مبسط وعملي",
      description: "محتوى مناسب لعمر 14-16 سنة مع أمثلة واقعية",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                🎯 استعد للنجاح
              </Badge>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              دليل شامل لاختبار الحاسب الآلي
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {" "}لمدارس التمريض
              </span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              منهج تدريبي متكامل مدة 4 أسابيع يشمل 12 درس شامل، بنك أسئلة ضخم، واختبارات تجريبية كاملة لتأهيلك للنجاح في اختبار القبول.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 md:px-8 md:py-6 text-base md:text-lg w-full sm:w-auto" onClick={() => setLocation("/lessons")}>
                ابدأ التعلم الآن
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="px-6 py-3 md:px-8 md:py-6 text-base md:text-lg w-full sm:w-auto" onClick={() => setLocation("/exams")}>
                تصفح الاختبارات
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="border-blue-100 hover:border-blue-300 transition">
                  <CardContent className="pt-6">
                    <Icon className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-blue-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا هذا الدليل؟
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              مصمم خصيصاً لطلاب التمريض بناءً على تحليل نماذج الامتحانات السابقة والمتطلبات الفعلية
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="border-blue-100 hover:border-blue-300 hover:shadow-lg transition">
                  <CardHeader>
                    <Icon className="w-10 h-10 text-blue-600 mb-3" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            الخطة الدراسية (4 أسابيع)
          </h3>
          <p className="text-lg text-gray-600">
            منهج منظم يغطي جميع موضوعات الاختبار بشكل تدريجي ومنطقي
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {curriculum.map((week, idx) => (
            <Card key={idx} className="border-blue-100 hover:border-blue-300 transition overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-blue-600 text-white mb-3">{week.week}</Badge>
                    <CardTitle>{week.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{week.hours}</p>
                    <p className="text-xs text-gray-600">ساعات</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {week.lessons.map((lesson, lidx) => (
                    <li key={lidx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Question Bank Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-blue-100 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              بنك الأسئلة الشامل
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              180+ سؤال متنوع لتقييم فهمك وتحضيرك للاختبار الفعلي
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-blue-200 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-blue-600">100</CardTitle>
                <CardDescription>أسئلة اختيار من متعدد</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">تغطي جميع موضوعات المنهج بمستويات صعوبة مختلفة</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-indigo-600">50</CardTitle>
                <CardDescription>أسئلة صح وخطأ</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">لاختبار فهمك للمفاهيم الأساسية والتفاصيل الدقيقة</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl text-purple-600">30</CardTitle>
                <CardDescription>أسئلة عملية</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">تطبيق عملي على البرامج والمهارات الفعلية</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mock Exams Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            اختبارات تجريبية كاملة
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            5 اختبارات شاملة تحاكي الاختبار الفعلي بنفس الصعوبة والتوقيت
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((num) => (
            <Card key={num} className="border-blue-100 hover:border-blue-300 transition cursor-pointer group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition">
                  <span className="text-lg font-bold text-blue-600 group-hover:text-white transition">{num}</span>
                </div>
                <p className="font-semibold text-gray-900">الاختبار {num}</p>
                <p className="text-sm text-gray-600 mt-2">20 سؤال - 20 دقيقة</p>
                <Button variant="ghost" className="mt-4 w-full text-blue-600 hover:text-blue-700" onClick={() => setLocation("/exams")}>
                  ابدأ الآن
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            هل أنت مستعد للنجاح؟
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            ابدأ رحلتك التدريبية اليوم وحقق حلمك في الالتحاق بمدرسة التمريض
          </p>
          <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold" onClick={() => setLocation("/exams")}>
            ابدأ الاختبارات الآن
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-gray-50 py-8" style={{backgroundColor: '#ffffff'}}>
        <div className="container mx-auto px-4">
          <div className="grid gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">الروابط السريعة</h4>
              <ul className="flex flex-wrap gap-3">
                <li>
                  <button
                    onClick={() => setLocation("/lessons")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition"
                  >
                    الدروس
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setLocation("/exams")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition"
                  >
                    الاختبارات
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setLocation("/dashboard")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition"
                  >
                    لوحة التحكم
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setLocation("/certificate")}
                    className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-600 transition"
                  >
                    الشهادة
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media & Contact */}
          <div className="border-t border-blue-100 pt-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">
                  تابعنا على وسائل التواصل
                </h4>
              
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/share/1JzvW7MBJw/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="https://x.com/moamenawadx_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition"
                  >
                    <X className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.instagram.com/moamenawadx?igsh=cnQyOWEwZzZ0MHc1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">تواصل معنا</h4>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <a href="mailto:moamenqasas@gmail.com" className="hover:text-blue-600">moamenqasas@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <a href="tel:+201000000000" className="hover:text-blue-600" style={{ direction: "ltr", unicodeBidi: "embed" }}>+20 106 339 1500</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-100 pt-8 text-center text-gray-600">
            <p>© 2026 دليل الاستعداد لاختبار حاسب التمريض المصري. جميع الحقوق محفوظة.</p>
            <p className="text-sm mt-2">تم تطويره بعناية لمساعدة طلاب التمريض على الاستعداد الأمثل للاختبار</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
