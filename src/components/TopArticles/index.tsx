import { Component } from 'preact'
import { Bem } from '@design-edito/tools/agnostic/css/bem'

export type TopArticle = {
    url?: string;
    title?: string;
    description?: string;
    img?: string;
    free?: string;
    author?: string;
    section?: string;
    subSection?: string;
    keywords?: string;
    publishedAt?: Date;
    modifiedAt?: Date;
};

export type Props = {
    orderBy?: 'pageview' | 'uniquePageview' | 'readingRate' | 'readingTime' | 'totalShare' | 'shareRate' | 'shareFb' | 'shareTw' | 'shareMail' | 'comment' | 'commentRate' | 'gift' | 'tunnelAccess' | 'abortion' | 'conversion' | 'conversionRate' | 'unsubwill' | 'churn' | string;
    lang?: 'fr' | 'en' | string;
    device?: 'all' | 'desktop' | 'mobile' | 'tablet' | 'mobile_ios' | 'mobile_android' | string;
    medium?: 'all' | 'search' | 'social' | 'direct' | 'internal' | string;
    since?: '1h' | '1d' | '2d' | '7d' | '30d' | string;
    publishedSince?: '1d' | '2d' | '3d' | '4d' | '5d' | '6d' | '7d' | '30d' | string;
    free?: boolean;
    author?: string;
    subsection?: string;
    section?: string;
    excludedSections?: string;
    excludedSubsections?: string;
    itemNumber?: number;
    page?: number;
    orderByDirection?: 'desc' | 'asc' | string;

    withTitle?: boolean;
    withDate?: boolean;
    dateFormat?: Intl.DateTimeFormatOptions,
    withCredits?: boolean;
    withImage?: boolean;
    withDescription?: boolean;
    withSection?: boolean;
    withSubSection?: boolean;

    topArticles?: TopArticle[],
}

export default class TopArticles extends Component<Props, {}> {
    static clss: string = 'lm-top-articles'

    clss = TopArticles.clss
    bemClss = Bem.bem('lm-top-articles')

    componentDidMount(): void {
    }

    render() {
        const { props, bemClss } = this

        const articleBemClss = Bem.bem('lm-top-article');
        const articleClasses = [articleBemClss.value]
        const contentClasses = [articleBemClss.elt('content').value]
        const titleClasses = [articleBemClss.elt('title').value]
        const descClasses = [articleBemClss.elt('desc').value]
        const imgClasses = [articleBemClss.elt('img').value]
        const dateClasses = [articleBemClss.elt('date').value]
        const creditsClass = [articleBemClss.elt('credits').value]

        const lmClasses = [bemClss.value]
       
        const _dateFormat = props.dateFormat || {
            year: '2-digit',
            month: '2-digit',
        };

        const _withTitle = props.withTitle ?? true;
        const _withDate = props.withDate ?? true;
        const _withCredits = props.withCredits ?? true;
        const _withImage = props.withImage ?? true;
        

        return (
            <div className={lmClasses.join(' ')}>
                {props.topArticles?.map((topArticle, i) => {
                    const formattedDate = topArticle.publishedAt?.toLocaleDateString(undefined, _dateFormat);

                    return (
                        <a href={topArticle.url} key={topArticle.url || i} className={articleClasses.join(' ')} target="_blank">
                            {_withImage && 
                                <img src={topArticle.img} alt="" className={imgClasses.join(' ')}/>
                            }
                            <div className={contentClasses.join(' ')}>
                                {_withTitle && 
                                    <p className={titleClasses.join(' ')}>{topArticle.title}</p>
                                }
                                {props?.withSection && 
                                    <p className={descClasses.join(' ')}>{topArticle.section}</p>
                                }
                                {props?.withSubSection && 
                                    <p className={descClasses.join(' ')}>{topArticle.subSection}</p>
                                }
                                {props?.withDescription && 
                                    <p className={descClasses.join(' ')}>{topArticle.description}</p>
                                }
                                {_withDate && 
                                    <p className={dateClasses.join(' ')}>{formattedDate}</p>
                                }
                                {_withCredits && 
                                    <p className={creditsClass.join(' ')}>{topArticle.author}</p>
                                }
                            </div>
                        </a>
                    )
                })}
            </div>
        )
    }
}
