import { Arrow } from '@radix-ui/react-select';
import { ArrowRight, BookCheck, Bookmark, DownloadCloud, Microscope } from 'lucide-react';
import React from 'react';

export default function IdeaContainer() {
  return (
    <div>
      <h2>IdeaContainer</h2>
      <div className="mx-2 h-screen  grid grid-cols-1  gap-8 md:grid-cols-2">
        {/* 카드2 */}
        <div className="flex flex-col tracking-tighter">
          <div className="relative aspect-square bg-blue-50/75 p-4  flex flex-col">
            {/* 상단 */}
            <div className="flex items-center justify-between ">
              <p className="whitespace-pre-line text-sm">{`업무 프로젝트 > 기획 프로젝트`}</p>
              <Bookmark className="w-8 h-8 text-gray-600" />
            </div>
            {/* 중앙 */}
            <div className="flex-1 flex gap-2 items-center">
              <p className="flex-1 text-xl font-semibold col-span-8 whitespace-pre-line leading-relaxed">
                "정치적 목적의 글쓰기는 세상을 더 낫게 만들기 위한 의도를 가지고 있으며, 비평가는
                그에 대한 지적 책임을 져야 한다."
              </p>
              {/* <Microscope className="w-12 h-12 text-blue-300" /> */}
            </div>
            <hr className="mb-2 border-gray-400" />
            {/* 하단 */}
            <div className="flex items-center gap-4 ">
              <p className="italic tracking-tighter text-sm text-gray-600">
                {`정치적 목적의\n글쓰기와 비평의 책임`}
              </p>
            </div>
            <hr className="mt-2 border-gray-400" />
          </div>
          <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl ">
            <div className="col-span-2 bg-violet-20 flex items-center justify-center">
              <DownloadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <div className="col-span-7 bg-violet-30 flex flex-wrap gap-2 p-2 items-center overflow-hidden">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #정치적 목적
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #비평의 책임
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #조지 오웰
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #가나다라마
              </span>
            </div>
            <div className="col-span-3 bg-violet-40 flex items-center justify-center">
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">더보기</p>
            </div>
            {/* <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            </div> */}
          </div>
        </div>
        {/* 카드3 */}
        <div className="flex flex-col tracking-tighter shadow-md">
          <div className="relative aspect-[3/1] bg-blue-50/75 p-4  flex flex-col">
            {/* 상단 */}
            <div className="flex items-center justify-between ">
              <p className="whitespace-pre-line text-sm">{`업무 프로젝트 > 기획 프로젝트`}</p>
              <Bookmark className="w-8 h-8 text-gray-600" />
            </div>
            {/* 중앙 */}
            <div className="flex-1 flex gap-2 items-center py-8">
              <p className="flex-1 text-2xl font-semibold col-span-8 whitespace-pre-line">{`정치적 목적의\n글쓰기와 비평의 책임\n글쓰기와 비평의 책임\n글쓰기와 비평의 책임`}</p>
              <Microscope className="w-12 h-12 text-gray-400" />
            </div>
            {/* 하단 */}
            {/* <hr className="mb-2 border-gray-400" />
            <div className="flex items-center gap-4 ">
              <p className="italic tracking-tighter text-sm text-gray-600">
                "정치적 목적의 글쓰기는 세상을 더 낫게 만들기 위한 의도를 가지고 있으며, 비평가는
                그에 대한 지적 책임을 져야 한다."
              </p>
            </div>
            <hr className="mt-2 border-gray-400" /> */}
          </div>
          <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl ">
            <div className="col-span-2 bg-violet-20 flex items-center justify-center">
              <DownloadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <div className="col-span-7 bg-violet-30 flex flex-wrap gap-2 p-2 items-center overflow-hidden">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #정치적 목적
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #비평의 책임
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #조지 오웰
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #가나다라마
              </span>
            </div>
            <div className="col-span-3 bg-violet-40 flex items-center justify-center">
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">더보기</p>
            </div>
            {/* <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            </div> */}
          </div>
        </div>
        {/* 카드1 */}
        <div className="flex flex-col tracking-tighter">
          <div className="relative aspect-square bg-blue-50 p-4  flex flex-col">
            {/* 상단 */}
            <div className="flex items-center justify-between ">
              <p className="whitespace-pre-line text-sm">{`업무 프로젝트 > 기획 프로젝트`}</p>
              <Bookmark className="w-8 h-8 text-gray-600" />
            </div>
            {/* 중앙 */}
            <div className="flex-1 flex gap-2 items-center">
              <p className="flex-1 text-2xl font-semibold col-span-8 whitespace-pre-line">{`애플의 고객 이해와 \n스토리텔링 전략`}</p>

              <ArrowRight className="w-8 h-8 text-gray-600" />
            </div>
            <hr className="mb-4 border-gray-400" />
            {/* 하단 */}
            <div className="flex items-center gap-4 ">
              <p className="italic tracking-tighter">
                "애플은 고객의 욕구와 난관을 정의하고 자신을 표현할 도구를 제공함으로써 고객의
                마음을 얻었다."
              </p>
            </div>
            <hr className="mt-4 border-gray-400" />
          </div>
          <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl ">
            <div className="col-span-2 bg-violet-20 flex items-center justify-center">
              <DownloadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <div className="col-span-5 bg-violet-30 flex items-center">
              <p className="whitespace-pre-line text-sm ">{`업무 프로젝트\n> 기획 프로젝트`}</p>
            </div>
            <div className="col-span-5 bg-violet-40 flex items-center justify-center gap-1">
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">원문</p>
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">더보기</p>
            </div>
            {/* <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            </div> */}
          </div>
        </div>

        <div className="flex flex-col tracking-tighter">
          <div className="relative aspect-square bg-blue-50 p-4 flex flex-col">
            {/* 상단 */}
            <div className="flex items-center justify-between">
              <p className="whitespace-pre-line">{`업무 프로젝트 > 기획 프로젝트`}</p>
              <BookCheck className="w-10 h-10 text-gray-400" />
            </div>
            {/* 중앙 */}
            <div className="flex-1 grid grid-cols-10 gap-2 items-center">
              <p className="text-2xl font-semibold col-span-8 whitespace-pre-line">{`애플의 고객 이해와 \n스토리텔링 전략`}</p>
              <div className="col-span-2 mx-auto">
                <ArrowRight className="w-8 h-8 text-gray-600" />
              </div>
            </div>
            {/* 하단 */}
            <div className="flex items-center gap-4 mb-4 italic text-gray-800">
              <p>
                "애플은 고객의 욕구와 난관을 정의하고 자신을 표현할 도구를 제공함으로써 고객의
                마음을 얻었다."
              </p>
            </div>
          </div>
          <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl ">
            <div className="col-span-2 bg-violet-20 flex items-center justify-center">
              <DownloadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <div className="col-span-7 bg-violet-30 flex flex-wrap gap-2 p-2 items-center overflow-hidden">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #애플
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #애플
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #가나다라마
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100">
                #가나다라마
              </span>
            </div>
            <div className="col-span-3 bg-violet-40 flex items-center justify-center">
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">더보기</p>
            </div>
            {/* <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            </div> */}
          </div>
        </div>
        <div className="flex flex-col tracking-tighter">
          <div className="relative aspect-square bg-blue-50"></div>
          <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl ">
            <div className="col-span-2 bg-violet-20 flex items-center justify-center">
              <DownloadCloud className="w-8 h-8 text-gray-600" />
            </div>
            <div className="col-span-5 bg-violet-30 flex items-center">
              <p className="whitespace-pre-line text-sm ">{`업무 프로젝트\n> 기획 프로젝트`}</p>
            </div>
            <div className="col-span-5 bg-violet-40 flex items-center justify-center gap-1">
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">원문</p>
              <p className="p-2 px-4 bg-black text-sm text-white rounded-full ">더보기</p>
            </div>
            {/* <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
